import { Injectable } from "@nestjs/common"
import { isValidObjectId } from "mongoose"
import {
  ContentModel,
  type ContentProcessingStep,
  type ContentStatus,
} from "@workspace/db"
import type { ContentEntity, NewPdfContent, NewUrlContent } from "../domain"
import { activeStatusForStep } from "../domain/processing-step"
import { ContentQueryRepository } from "./content.query"
import { mapContentDoc } from "./content.mapper"
import {
  buildMongoContentUpdate,
  type ContentUpdatePatch,
} from "./build-mongo-update"

const MONGO_DUPLICATE_KEY = 11000

type MongoDuplicateError = {
  readonly code: number
}

export type { ContentUpdatePatch }

type ClaimInput = {
  readonly contentId: string
  readonly workerId: string
  readonly fromStatuses: readonly ContentStatus[]
}

type RequeueStaleInput = {
  readonly contentId: string
  readonly staleBefore: Date
  readonly fromStatuses: readonly ContentStatus[]
}

type UpdateForUserInput = {
  readonly userId: string
  readonly contentId: string
  readonly patch: ContentUpdatePatch
}

function isMongoDuplicateKey(error: object): error is MongoDuplicateError {
  return "code" in error && error.code === MONGO_DUPLICATE_KEY
}

function resolveResumeStep(
  step: ContentProcessingStep | undefined
): ContentProcessingStep {
  return step ?? "EXTRACT"
}

@Injectable()
export class ContentCommandRepository {
  constructor(private readonly queryRepo: ContentQueryRepository) {}

  async insertUrlOrGetExisting(data: NewUrlContent): Promise<{
    readonly entity: ContentEntity
    readonly created: boolean
  }> {
    try {
      const doc = await ContentModel.create({
        userId: data.userId,
        sourceType: data.sourceType,
        sourceUrl: data.sourceUrl,
        normalizedUrl: data.normalizedUrl,
        status: "PENDING",
        isOrphan: true,
        libraryStatus: "QUEUE",
      })
      return { entity: mapContentDoc(doc), created: true }
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        isMongoDuplicateKey(error)
      ) {
        const existing = await this.queryRepo.findByNormalizedUrl(
          data.userId,
          data.normalizedUrl
        )
        if (existing) return { entity: existing, created: false }
      }
      throw error
    }
  }

  async insertPdf(data: NewPdfContent): Promise<ContentEntity> {
    const doc = await ContentModel.create({
      userId: data.userId,
      sourceType: "PDF",
      sourceFileMeta: {
        originalName: data.originalName,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
      },
      status: "PENDING",
      isOrphan: true,
      libraryStatus: "QUEUE",
    })
    return mapContentDoc(doc)
  }

  async claimForProcessing(input: ClaimInput): Promise<ContentEntity | null> {
    if (!isValidObjectId(input.contentId)) return null

    const current = await ContentModel.findOne({
      _id: input.contentId,
      isDeleted: false,
      status: { $in: [...input.fromStatuses] },
    }).select({ processingStep: 1 })

    if (!current) return null

    const resumeStep = resolveResumeStep(current.processingStep)
    const doc = await ContentModel.findOneAndUpdate(
      {
        _id: input.contentId,
        isDeleted: false,
        status: { $in: [...input.fromStatuses] },
      },
      {
        $set: {
          status: activeStatusForStep(resumeStep),
          processingStep: resumeStep,
          lockedAt: new Date(),
          lockedBy: input.workerId,
        },
        $unset: { errorMessage: "", errorCode: "" },
      },
      { returnDocument: "after" }
    )
    return doc ? mapContentDoc(doc) : null
  }

  async requeueStale(input: RequeueStaleInput): Promise<ContentEntity | null> {
    if (!isValidObjectId(input.contentId)) return null
    const doc = await ContentModel.findOneAndUpdate(
      {
        _id: input.contentId,
        isDeleted: false,
        status: { $in: [...input.fromStatuses] },
        lockedAt: { $lt: input.staleBefore },
      },
      {
        $set: { status: "PENDING" },
        $inc: { retryCount: 1 },
        $unset: { lockedAt: "", lockedBy: "" },
      },
      { returnDocument: "after" }
    )
    return doc ? mapContentDoc(doc) : null
  }

  async updateIfActive(
    contentId: string,
    patch: ContentUpdatePatch
  ): Promise<ContentEntity | null> {
    if (!isValidObjectId(contentId)) return null
    const update = buildMongoContentUpdate(patch)
    if (!update) return null

    const doc = await ContentModel.findOneAndUpdate(
      { _id: contentId, isDeleted: false },
      update,
      { returnDocument: "after" }
    )
    return doc ? mapContentDoc(doc) : null
  }

  async updateIfActiveForUser(
    input: UpdateForUserInput
  ): Promise<ContentEntity | null> {
    if (!isValidObjectId(input.contentId)) return null
    const update = buildMongoContentUpdate(input.patch)
    if (!update) return null

    const doc = await ContentModel.findOneAndUpdate(
      {
        _id: input.contentId,
        userId: input.userId,
        isDeleted: false,
      },
      update,
      { returnDocument: "after" }
    )
    return doc ? mapContentDoc(doc) : null
  }
}
