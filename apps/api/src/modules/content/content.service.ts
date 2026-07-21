import { Injectable } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import type {
  ContentListQuery,
  ContentResponse,
  ContentTrashItem,
  SaveUrlContent,
  UpdateContent,
} from "@workspace/contracts"
import { ingestionEnv } from "@workspace/config/ingestion"
import { detectYoutubeVideoId, normalizeUrl } from "@workspace/extractors"
import { AppEvents } from "@/common/events"
import {
  ContentCommandRepository,
  ContentLifecycleRepository,
  ContentProcessingRepository,
  ContentQueryRepository,
  ContentTempFileStore,
  UserIngestionQuotaRepository,
} from "./repository"
import {
  ContentFileTooLargeException,
  ContentNotFoundException,
  ContentTrashNotFoundException,
  ContentUnsupportedFormatException,
  DailyIngestionLimitException,
  InvalidContentUpdateException,
  type ContentActorScope,
  type ContentMutationScope,
} from "./domain"
import { buildContentUpdatePatch, toContentResponse } from "./dto"
import { ContentIngestionRequestedEvent } from "./events"

type PdfUploadFile = {
  readonly buffer: Buffer
  readonly mimetype: string
  readonly originalname: string
  readonly size: number
}

@Injectable()
export class ContentService {
  constructor(
    private readonly queryRepo: ContentQueryRepository,
    private readonly commandRepo: ContentCommandRepository,
    private readonly processingRepo: ContentProcessingRepository,
    private readonly lifecycleRepo: ContentLifecycleRepository,
    private readonly quotaRepo: UserIngestionQuotaRepository,
    private readonly tempFileStore: ContentTempFileStore,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async saveUrl(
    scope: ContentActorScope,
    input: SaveUrlContent
  ): Promise<ContentResponse> {
    const normalized = normalizeUrl(input.url)
    const existing = await this.queryRepo.findByNormalizedUrl(
      scope.userId,
      normalized
    )
    if (existing) return toContentResponse(existing)

    const reserved = await this.quotaRepo.tryReserveIngestionSlot(scope.userId)
    if (!reserved.ok) {
      if (reserved.reason === "at_cap") {
        throw new DailyIngestionLimitException()
      }
      throw new InvalidContentUpdateException(
        "Unable to reserve ingestion slot"
      )
    }

    const sourceType = detectYoutubeVideoId(input.url) ? "YOUTUBE" : "ARTICLE"
    const { entity, created } = await this.commandRepo.insertUrlOrGetExisting({
      userId: scope.userId,
      sourceType,
      sourceUrl: input.url.trim(),
      normalizedUrl: normalized,
    })

    if (!created) {
      await this.quotaRepo.releaseIngestionSlot(scope.userId)
      return toContentResponse(entity)
    }

    this.emitIngestion(entity.id, scope.userId)
    return toContentResponse(entity)
  }

  async savePdf(
    scope: ContentActorScope,
    file: PdfUploadFile
  ): Promise<ContentResponse> {
    if (file.mimetype !== "application/pdf") {
      throw new ContentUnsupportedFormatException()
    }
    if (file.size > ingestionEnv.CONTENT_UPLOAD_MAX_BYTES) {
      throw new ContentFileTooLargeException()
    }

    const reserved = await this.quotaRepo.tryReserveIngestionSlot(scope.userId)
    if (!reserved.ok) {
      if (reserved.reason === "at_cap") {
        throw new DailyIngestionLimitException()
      }
      throw new InvalidContentUpdateException(
        "Unable to reserve ingestion slot"
      )
    }

    const entity = await this.commandRepo.insertPdf({
      userId: scope.userId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    })
    await this.tempFileStore.savePdf({
      contentId: entity.id,
      buffer: file.buffer,
    })
    this.emitIngestion(entity.id, scope.userId)
    return toContentResponse(entity)
  }

  async list(
    scope: ContentActorScope,
    query: ContentListQuery = {}
  ): Promise<{ items: ContentResponse[] }> {
    const items = await this.queryRepo.listForUser(scope.userId, query)
    return { items: items.map(toContentResponse) }
  }

  async listTrash(
    scope: ContentActorScope
  ): Promise<{ items: ContentTrashItem[] }> {
    const items = await this.lifecycleRepo.listTrash(scope.userId)
    return { items: [...items] }
  }

  async restoreTrash(input: {
    readonly userId: string
    readonly trashId: string
  }): Promise<ContentResponse> {
    const restored = await this.lifecycleRepo.restoreFromTrash(input)
    if (!restored) throw new ContentTrashNotFoundException()
    await this.quotaRepo.incrementContentCount(input.userId)
    return toContentResponse(restored)
  }

  async getById(scope: ContentMutationScope): Promise<ContentResponse> {
    const entity = await this.queryRepo.findByIdForUser(
      scope.userId,
      scope.contentId
    )
    if (!entity) throw new ContentNotFoundException()
    return toContentResponse(entity)
  }

  async update(
    scope: ContentMutationScope,
    input: UpdateContent
  ): Promise<ContentResponse> {
    const hasField =
      input.title !== undefined ||
      input.summary !== undefined ||
      input.libraryStatus !== undefined ||
      input.topicIds !== undefined
    if (!hasField) throw new InvalidContentUpdateException()

    if (input.topicIds !== undefined) {
      const linked = await this.processingRepo.replaceTopicLinks({
        userId: scope.userId,
        contentId: scope.contentId,
        topicIds: input.topicIds,
      })
      if (!linked) throw new ContentNotFoundException()
    }

    const patch = buildContentUpdatePatch(input)
    if (Object.keys(patch).length === 0) return this.getById(scope)

    const updated = await this.commandRepo.updateIfActiveForUser({
      userId: scope.userId,
      contentId: scope.contentId,
      patch,
    })
    if (!updated) throw new ContentNotFoundException()
    return toContentResponse(updated)
  }

  async retry(scope: ContentMutationScope): Promise<ContentResponse> {
    const reset = await this.processingRepo.resetFailedForRetry({
      userId: scope.userId,
      contentId: scope.contentId,
    })
    if (!reset) throw new ContentNotFoundException("Failed content not found")
    this.emitIngestion(reset.id, scope.userId)
    return toContentResponse(reset)
  }

  async regenerate(scope: ContentMutationScope): Promise<ContentResponse> {
    const reset = await this.processingRepo.resetForRegenerate({
      userId: scope.userId,
      contentId: scope.contentId,
    })
    if (!reset) {
      throw new ContentNotFoundException(
        "Content not found or not eligible for regenerate"
      )
    }
    this.emitIngestion(reset.id, scope.userId)
    return toContentResponse(reset)
  }

  async softDelete(scope: ContentMutationScope): Promise<void> {
    const ok = await this.lifecycleRepo.softDelete(
      scope.userId,
      scope.contentId
    )
    if (!ok) throw new ContentNotFoundException()
    await this.quotaRepo.decrementContentCount(scope.userId)
  }

  async permanentDelete(scope: ContentMutationScope): Promise<void> {
    const ok = await this.lifecycleRepo.permanentDelete({
      userId: scope.userId,
      contentId: scope.contentId,
    })
    if (!ok) throw new ContentNotFoundException()
    await this.quotaRepo.decrementContentCount(scope.userId)
  }

  async purgeExpiredTrash(): Promise<number> {
    return this.lifecycleRepo.purgeExpiredSoftDeleted()
  }

  async purgeAllForUser(userId: string): Promise<void> {
    await this.lifecycleRepo.purgeAllForUser(userId)
  }

  private emitIngestion(contentId: string, userId: string): void {
    this.eventEmitter.emit(
      AppEvents.CONTENT_INGESTION_REQUESTED,
      new ContentIngestionRequestedEvent(contentId, userId)
    )
  }
}
