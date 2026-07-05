import type { JobQueueConfig, JobQueue } from "./types"
import { InlineJobQueueAdapter } from "./adapters/inline"
import { RedisJobQueueAdapter } from "./adapters/redis"

export function createJobQueue(config: JobQueueConfig): JobQueue {
  switch (config.provider) {
    case "inline":
      return new InlineJobQueueAdapter()
    case "redis":
      return new RedisJobQueueAdapter(config)
    default: {
      const _exhaustive: never = config
      throw new Error(`Unknown job queue provider: ${_exhaustive}`)
    }
  }
}
