import { ContentDeletedDuringIngestionError } from "../domain"
import { logIngestionAttempt } from "../repository"
import { embedContentChunks } from "./embed-content"
import type { PipelineState, ProcessStepsDeps } from "./types"

export async function runEmbedStep(
  deps: ProcessStepsDeps,
  state: PipelineState
): Promise<void> {
  const started = Date.now()
  const fresh = await deps.queryRepo.findByIdForUser(
    state.claimed.userId,
    state.claimed.id
  )
  if (!fresh || fresh.isDeleted) {
    throw new ContentDeletedDuringIngestionError(state.claimed.id)
  }

  await embedContentChunks({
    ai: deps.ai,
    userId: state.claimed.userId,
    contentId: state.claimed.id,
    text: state.extractedText,
  })

  const updated = await deps.commandRepo.updateIfActive(state.claimed.id, {
    status: "COMPLETED",
    lockedAt: null,
    lockedBy: null,
  })

  await logIngestionAttempt({
    contentId: state.claimed.id,
    userId: state.claimed.userId,
    step: "EMBED",
    outcome: "SUCCESS",
    durationMs: Date.now() - started,
    attemptNumber: state.claimed.retryCount + 1,
  })

  if (!updated) {
    throw new ContentDeletedDuringIngestionError(state.claimed.id)
  }
}
