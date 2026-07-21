import { Injectable } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import {
  createGeminiAiClient,
  AiProviderError,
  type AiClient,
} from "@workspace/ai"
import { ingestionEnv } from "@workspace/config/ingestion"
import { aiEnv } from "@workspace/config/ai"
import { createLogger } from "@workspace/logger"
import type { ContentEntity } from "@/modules/content/domain"
import {
  ContentCommandRepository,
  ContentProcessingRepository,
  ContentQueryRepository,
} from "@/modules/content/repository"
import { MongoAiUsageStore } from "./repository"
import {
  INGESTION_ACTIVE_STATUSES,
  INGESTION_CLAIM_STATUSES,
  isActiveIngestionStatus,
  ContentDeletedDuringIngestionError,
} from "./domain"
import { handleIngestionFailure, runIngestionSteps } from "./pipeline"

@Injectable()
export class IngestionService {
  private readonly logger = createLogger("IngestionPipeline")
  private readonly workerId = `api-${process.pid}`
  private aiClient: AiClient | null = null

  constructor(
    private readonly queryRepo: ContentQueryRepository,
    private readonly commandRepo: ContentCommandRepository,
    private readonly processingRepo: ContentProcessingRepository,
    private readonly usageStore: MongoAiUsageStore
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async scanStaleAndPending(): Promise<void> {
    const staleBefore = new Date(
      Date.now() - ingestionEnv.INGESTION_STALE_JOB_MS
    )
    const items = await this.queryRepo.findPendingOrStale({
      staleBefore,
      statuses: [...INGESTION_ACTIVE_STATUSES],
      limit: 10,
    })

    for (const item of items) {
      await this.requeueIfStale({ item, staleBefore })
      await this.processContent(item.id)
    }
  }

  async processContent(contentId: string): Promise<void> {
    const claimed = await this.commandRepo.claimForProcessing({
      contentId,
      workerId: this.workerId,
      fromStatuses: [...INGESTION_CLAIM_STATUSES],
    })
    if (!claimed) return

    try {
      await runIngestionSteps(
        {
          ai: this.getAi(),
          queryRepo: this.queryRepo,
          commandRepo: this.commandRepo,
          processingRepo: this.processingRepo,
        },
        claimed
      )
    } catch (error) {
      if (error instanceof ContentDeletedDuringIngestionError) {
        this.logger.info({ contentId }, "ingestion cancelled — content deleted")
        return
      }
      this.logger.error({ err: error, contentId }, "ingestion failed")
      const failure =
        error instanceof Error ? error : new Error("Ingestion failed")
      await handleIngestionFailure({
        commandRepo: this.commandRepo,
        userId: claimed.userId,
        contentId,
        retryCount: claimed.retryCount,
        failedStep: claimed.processingStep ?? "EXTRACT",
        error: failure,
      })
    }
  }

  private getAi(): AiClient {
    if (this.aiClient) return this.aiClient
    if (!aiEnv.GEMINI_API_KEY) {
      throw new AiProviderError("GEMINI_API_KEY is not configured")
    }
    this.aiClient = createGeminiAiClient({ usageStore: this.usageStore })
    return this.aiClient
  }

  private async requeueIfStale(input: {
    readonly item: ContentEntity
    readonly staleBefore: Date
  }): Promise<void> {
    const { item, staleBefore } = input
    if (!isActiveIngestionStatus(item.status)) return
    if (!item.lockedAt || item.lockedAt >= staleBefore) return

    await this.commandRepo.requeueStale({
      contentId: item.id,
      staleBefore,
      fromStatuses: [...INGESTION_ACTIVE_STATUSES],
    })
  }
}
