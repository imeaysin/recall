import { ContentDeletedDuringIngestionError } from "../domain"
import { logIngestionAttempt } from "../repository"
import {
  assertStillActive,
  type PipelineState,
  type ProcessStepsDeps,
} from "./types"

export async function runMetadataStep(
  deps: ProcessStepsDeps,
  state: PipelineState
): Promise<PipelineState> {
  const started = Date.now()
  const fresh = await deps.queryRepo.findByIdForUser(
    state.claimed.userId,
    state.claimed.id
  )
  if (!fresh || fresh.isDeleted) {
    throw new ContentDeletedDuringIngestionError(state.claimed.id)
  }

  const metadata = await deps.ai.generateMetadata(state.extractedText)
  const updated = await deps.processingRepo.applyAiMetadata({
    contentId: state.claimed.id,
    title: metadata.title,
    summary: metadata.summary,
    language: fresh.language,
  })

  await logIngestionAttempt({
    contentId: state.claimed.id,
    userId: state.claimed.userId,
    step: "METADATA",
    outcome: "SUCCESS",
    durationMs: Date.now() - started,
    attemptNumber: state.claimed.retryCount + 1,
  })

  if (!updated) {
    throw new ContentDeletedDuringIngestionError(state.claimed.id)
  }
  assertStillActive(updated, "METADATA")

  return {
    claimed: state.claimed,
    extractedText: state.extractedText,
    topics: metadata.topics,
  }
}
