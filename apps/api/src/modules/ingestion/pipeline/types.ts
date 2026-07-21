import type { AiClient } from "@workspace/ai"
import type { ContentEntity } from "@/modules/content/domain"
import type {
  ContentCommandRepository,
  ContentProcessingRepository,
  ContentQueryRepository,
  ContentTempFileStore,
} from "@/modules/content/repository"
import type {
  TopicIngestionRepository,
  TopicRootRepository,
} from "@/modules/topics/repository"
import { ContentDeletedDuringIngestionError } from "../domain"

export type ProcessStepsDeps = {
  readonly ai: AiClient
  readonly queryRepo: ContentQueryRepository
  readonly commandRepo: ContentCommandRepository
  readonly processingRepo: ContentProcessingRepository
  readonly topicRootRepo: TopicRootRepository
  readonly topicIngestionRepo: TopicIngestionRepository
  readonly tempFileStore: ContentTempFileStore
}

export type PipelineState = {
  readonly claimed: ContentEntity
  readonly extractedText: string
  readonly topics: readonly string[]
}

export function assertStillActive(
  updated: ContentEntity | null,
  _step: string
): asserts updated is ContentEntity {
  if (!updated) {
    throw new ContentDeletedDuringIngestionError("unknown")
  }
}
