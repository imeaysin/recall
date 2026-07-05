import { createLogger } from "@workspace/logger"
import type { JobHandler, JobPayload, JobQueue } from "../types"

export class InlineJobQueueAdapter implements JobQueue {
  private readonly logger = createLogger("Jobs")
  private readonly handlers = new Map<string, JobHandler>()

  register<T extends JobPayload>(name: string, handler: JobHandler<T>): void {
    this.handlers.set(name, handler as JobHandler)
  }

  enqueue<T extends JobPayload>(name: string, payload: T): void {
    const handler = this.handlers.get(name)
    if (!handler) {
      this.logger.warn({ job: name }, "no handler registered for job")
      return
    }

    queueMicrotask(async () => {
      try {
        await handler(payload)
      } catch (err) {
        this.logger.error({ err, job: name }, "job failed")
      }
    })
  }

  async close(): Promise<void> {
    // in-process only — nothing to tear down
  }
}
