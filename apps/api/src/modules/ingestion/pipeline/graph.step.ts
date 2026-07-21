import { ContentDeletedDuringIngestionError } from "../domain"
import { logIngestionAttempt } from "../repository"
import { computeIsOrphanFromNormalizedNames } from "@/modules/topics/domain/is-orphan"
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

  let linked = await deps.topicIngestionRepo.upsertTopicsForContent({
    userId: state.claimed.userId,
    contentId: state.claimed.id,
    topicNames: state.topics,
  })

  const isOrphan = computeIsOrphanFromNormalizedNames(
    linked.map((topic) => topic.normalizedName)
  )

  if (linked.length === 0) {
    const root = await deps.topicRootRepo.ensureRootTopic(state.claimed.userId)
    const rootLink = await deps.topicRootRepo.linkContentToTopic({
      topic: root,
      contentId: state.claimed.id,
    })
    linked = [rootLink]
  }

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
    isOrphan,
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
