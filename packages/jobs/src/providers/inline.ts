import { createLogger } from "@workspace/logger"
import type { JobHandler, JobPayload, JobQueue } from "../types"

export function createInlineJobQueue(): JobQueue {
  const logger = createLogger("Jobs")
  const handlers = new Map<string, JobHandler>()

  return {
    register<T extends JobPayload>(name: string, handler: JobHandler<T>) {
      handlers.set(name, handler as JobHandler)
    },

    enqueue<T extends JobPayload>(name: string, payload: T) {
      const handler = handlers.get(name)
      if (!handler) {
        logger.warn({ job: name }, "no handler registered for job")
        return
      }

      queueMicrotask(async () => {
        try {
          await handler(payload)
        } catch (err) {
          logger.error({ err, job: name }, "job failed")
        }
      })
    },

    async close() {
      // in-process only — nothing to tear down
    },
  }
}
