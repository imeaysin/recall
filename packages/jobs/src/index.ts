import { createInlineJobQueue } from "./inline-queue"
import type { JobQueue, JobQueueConfig } from "./types"

export { createInlineJobQueue } from "./inline-queue"
export type { JobHandler, JobPayload, JobQueue, JobQueueConfig } from "./types"

export function createJobQueue(
  _config: JobQueueConfig = { provider: "inline" }
): JobQueue {
  return createInlineJobQueue()
}
