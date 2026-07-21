import { EventEmitter2 } from "@nestjs/event-emitter"
import { Test } from "@nestjs/testing"
import { ContentService } from "@/modules/content/content.service"
import {
  ContentNotFoundException,
  DailyIngestionLimitException,
  InvalidContentUpdateException,
  type ContentEntity,
} from "@/modules/content/domain"
import {
  ContentCommandRepository,
  ContentLifecycleRepository,
  ContentProcessingRepository,
  ContentQueryRepository,
  UserIngestionQuotaRepository,
} from "@/modules/content/repository"

describe("ContentService", () => {
  const queryRepo = {
    listForUser: jest.fn(),
    findByIdForUser: jest.fn(),
    findByNormalizedUrl: jest.fn(),
  }
  const commandRepo = {
    insertUrlOrGetExisting: jest.fn(),
    updateIfActiveForUser: jest.fn(),
  }
  const processingRepo = {
    resetFailedForRetry: jest.fn(),
    replaceTopicLinks: jest.fn(),
  }
  const lifecycleRepo = {
    softDelete: jest.fn(),
    purgeAllForUser: jest.fn(),
    purgeExpiredSoftDeleted: jest.fn(),
  }
  const quotaRepo = {
    tryReserveIngestionSlot: jest.fn(),
    releaseIngestionSlot: jest.fn(),
    decrementContentCount: jest.fn(),
  }
  const eventEmitter = {
    emit: jest.fn(),
  }

  let service: ContentService

  const scope = { userId: "user-1" }
  const now = new Date("2026-07-21T12:00:00.000Z")

  const entity: ContentEntity = {
    id: "507f1f77bcf86cd799439011",
    userId: "user-1",
    sourceType: "ARTICLE",
    sourceUrl: "https://example.com/a",
    normalizedUrl: "https://example.com/a",
    titleEditedByUser: false,
    summaryEditedByUser: false,
    topicRefs: [],
    topicSnapshot: [],
    isOrphan: true,
    status: "PENDING",
    retryCount: 0,
    libraryStatus: "QUEUE",
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ContentService,
        { provide: ContentQueryRepository, useValue: queryRepo },
        { provide: ContentCommandRepository, useValue: commandRepo },
        { provide: ContentProcessingRepository, useValue: processingRepo },
        { provide: ContentLifecycleRepository, useValue: lifecycleRepo },
        { provide: UserIngestionQuotaRepository, useValue: quotaRepo },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile()

    service = moduleRef.get(ContentService)
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("returns existing URL without consuming quota", async () => {
    queryRepo.findByNormalizedUrl.mockResolvedValue(entity)

    const result = await service.saveUrl(scope, {
      url: "https://example.com/a",
    })

    expect(result.id).toBe(entity.id)
    expect(quotaRepo.tryReserveIngestionSlot).not.toHaveBeenCalled()
    expect(eventEmitter.emit).not.toHaveBeenCalled()
  })

  it("saves a new URL, reserves quota, and emits ingestion", async () => {
    queryRepo.findByNormalizedUrl.mockResolvedValue(null)
    quotaRepo.tryReserveIngestionSlot.mockResolvedValue({ ok: true })
    commandRepo.insertUrlOrGetExisting.mockResolvedValue({
      entity,
      created: true,
    })

    const result = await service.saveUrl(scope, {
      url: "https://example.com/a",
    })

    expect(result.id).toBe(entity.id)
    expect(result.status).toBe("PENDING")
    expect(quotaRepo.tryReserveIngestionSlot).toHaveBeenCalledWith("user-1")
    expect(eventEmitter.emit).toHaveBeenCalled()
  })

  it("releases quota when concurrent insert loses the race", async () => {
    queryRepo.findByNormalizedUrl.mockResolvedValue(null)
    quotaRepo.tryReserveIngestionSlot.mockResolvedValue({ ok: true })
    commandRepo.insertUrlOrGetExisting.mockResolvedValue({
      entity,
      created: false,
    })

    await service.saveUrl(scope, { url: "https://example.com/a" })

    expect(quotaRepo.releaseIngestionSlot).toHaveBeenCalledWith("user-1")
    expect(eventEmitter.emit).not.toHaveBeenCalled()
  })

  it("rejects save when daily ingestion cap is reached", async () => {
    queryRepo.findByNormalizedUrl.mockResolvedValue(null)
    quotaRepo.tryReserveIngestionSlot.mockResolvedValue({
      ok: false,
      reason: "at_cap",
    })

    await expect(
      service.saveUrl(scope, { url: "https://example.com/a" })
    ).rejects.toBeInstanceOf(DailyIngestionLimitException)
  })

  it("throws not found for missing content", async () => {
    queryRepo.findByIdForUser.mockResolvedValue(null)

    await expect(
      service.getById({ userId: "user-1", contentId: entity.id })
    ).rejects.toBeInstanceOf(ContentNotFoundException)
  })

  it("rejects empty updates", async () => {
    await expect(
      service.update({ userId: "user-1", contentId: entity.id }, {})
    ).rejects.toBeInstanceOf(InvalidContentUpdateException)
  })

  it("updates topic links when topicIds are provided", async () => {
    processingRepo.replaceTopicLinks.mockResolvedValue({
      ...entity,
      isOrphan: false,
      topicRefs: ["507f1f77bcf86cd799439012"],
    })
    commandRepo.updateIfActiveForUser.mockResolvedValue({
      ...entity,
      title: "Edited",
      titleEditedByUser: true,
      isOrphan: false,
      topicRefs: ["507f1f77bcf86cd799439012"],
    })

    const result = await service.update(
      { userId: "user-1", contentId: entity.id },
      { title: "Edited", topicIds: ["507f1f77bcf86cd799439012"] }
    )

    expect(processingRepo.replaceTopicLinks).toHaveBeenCalled()
    expect(result.title).toBe("Edited")
  })

  it("retries failed content and emits ingestion", async () => {
    processingRepo.resetFailedForRetry.mockResolvedValue({
      ...entity,
      status: "PENDING",
    })

    await service.retry({ userId: "user-1", contentId: entity.id })

    expect(eventEmitter.emit).toHaveBeenCalled()
  })

  it("soft-deletes owned content and decrements counter", async () => {
    lifecycleRepo.softDelete.mockResolvedValue(true)

    await expect(
      service.softDelete({ userId: "user-1", contentId: entity.id })
    ).resolves.toBeUndefined()
    expect(quotaRepo.decrementContentCount).toHaveBeenCalledWith("user-1")
  })
})
