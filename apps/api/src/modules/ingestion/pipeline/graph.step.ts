import { ContentDeletedDuringIngestionError } from "../domain"
import { upsertTopicsForContent, logIngestionAttempt } from "../repository"
import {
  assertStillActive,
  type PipelineState,
  type ProcessStepsDeps,
} from "./types"

export async function runGraphStep(
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

  const linked = await upsertTopicsForContent({
    userId: state.claimed.userId,
    contentId: state.claimed.id,
    topicNames: state.topics,
  })

  const stillActive = await deps.queryRepo.findByIdForUser(
    state.claimed.userId,
    state.claimed.id
  )
  if (!stillActive || stillActive.isDeleted) {
    throw new ContentDeletedDuringIngestionError(state.claimed.id)
  }

  const updated = await deps.commandRepo.updateIfActive(state.claimed.id, {
    status: "EMBEDDING",
    processingStep: "EMBED",
    topicRefs: linked.map((topic) => topic.topicId),
    topicSnapshot: linked.map((topic) => ({
      topicId: topic.topicId,
      name: topic.name,
    })),
    isOrphan: linked.length === 0,
  })

  await logIngestionAttempt({
    contentId: state.claimed.id,
    userId: state.claimed.userId,
    step: "GRAPH",
    outcome: "SUCCESS",
    durationMs: Date.now() - started,
    attemptNumber: state.claimed.retryCount + 1,
  })

  if (!updated) {
    throw new ContentDeletedDuringIngestionError(state.claimed.id)
  }
  assertStillActive(updated, "GRAPH")
}
