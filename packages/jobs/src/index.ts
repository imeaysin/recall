import { createInlineJobQueue } from "./providers/inline"
import { createRedisJobQueue } from "./providers/redis"
import type { JobQueue, JobQueueConfig } from "./types"

export { createInlineJobQueue } from "./providers/inline"
export { createRedisJobQueue } from "./providers/redis"
export type {
  InlineJobQueueConfig,
  JobHandler,
  JobPayload,
  JobQueue,
  JobQueueConfig,
  RedisJobQueueConfig,
} from "./types"

export function createJobQueue(config: JobQueueConfig): JobQueue {
  switch (config.provider) {
    case "inline":
      return createInlineJobQueue()
    case "redis":
      return createRedisJobQueue(config)
    default: {
      const _exhaustive: never = config
      throw new Error(
        `Unknown jobs provider: ${(_exhaustive as JobQueueConfig).provider}`
      )
    }
  }
}
