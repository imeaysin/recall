import { Queue, Worker } from "bullmq"
import { createLogger } from "@workspace/logger"
import type {
  JobHandler,
  JobPayload,
  JobQueue,
  RedisJobQueueConfig,
} from "../types"

const DEFAULT_QUEUE_NAME = "theo"

export class RedisJobQueueAdapter implements JobQueue {
  private readonly logger = createLogger("Jobs")
  private readonly handlers = new Map<string, JobHandler>()
  private readonly queueName: string
  private readonly connection: { url: string; maxRetriesPerRequest: null }
  private readonly queue: Queue
  private worker: Worker | null = null

  constructor(config: RedisJobQueueConfig) {
    this.queueName = config.queueName ?? DEFAULT_QUEUE_NAME
    this.connection = {
      url: config.redisUrl,
      maxRetriesPerRequest: null,
    }
    this.queue = new Queue(this.queueName, { connection: this.connection })
  }

  private ensureWorker(): void {
    if (this.worker) return

    this.worker = new Worker(
      this.queueName,
      async (job) => {
        const handler = this.handlers.get(job.name)
        if (!handler) {
          this.logger.warn({ job: job.name }, "no handler registered for job")
          return
        }
        await handler(job.data as JobPayload)
      },
      { connection: this.connection }
    )

    this.worker.on("failed", (job, err) => {
      this.logger.error({ err, job: job?.name }, "job failed")
    })
  }

  register<T extends JobPayload>(name: string, handler: JobHandler<T>): void {
    this.handlers.set(name, handler as JobHandler)
    this.ensureWorker()
  }

  enqueue<T extends JobPayload>(name: string, payload: T): void {
    void this.queue.add(name, payload).catch((err) => {
      this.logger.error({ err, job: name }, "failed to enqueue job")
    })
  }

  async close(): Promise<void> {
    if (this.worker) {
      await this.worker.close()
    }
    await this.queue.close()
  }
}
