import type { AiClient } from "@workspace/ai"
import type { ContentEntity } from "@/modules/content/domain"
import type {
  ContentCommandRepository,
  ContentProcessingRepository,
  ContentQueryRepository,
} from "@/modules/content/repository"
import { ContentDeletedDuringIngestionError } from "../domain"

export type ProcessStepsDeps = {
  readonly ai: AiClient
  readonly queryRepo: ContentQueryRepository
  readonly commandRepo: ContentCommandRepository
  readonly processingRepo: ContentProcessingRepository
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
