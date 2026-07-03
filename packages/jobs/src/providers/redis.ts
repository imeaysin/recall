import { Queue, Worker } from "bullmq"
import { createLogger } from "@workspace/logger"
import type {
  JobHandler,
  JobPayload,
  JobQueue,
  RedisJobQueueConfig,
} from "../types"

const DEFAULT_QUEUE_NAME = "theo"

export function createRedisJobQueue(config: RedisJobQueueConfig): JobQueue {
  const logger = createLogger("Jobs")
  const handlers = new Map<string, JobHandler>()
  const queueName = config.queueName ?? DEFAULT_QUEUE_NAME

  const connection = {
    url: config.redisUrl,
    maxRetriesPerRequest: null,
  }

  const queue = new Queue(queueName, { connection })
  let worker: Worker | null = null

  function ensureWorker() {
    if (worker) return

    worker = new Worker(
      queueName,
      async (job) => {
        const handler = handlers.get(job.name)
        if (!handler) {
          logger.warn({ job: job.name }, "no handler registered for job")
          return
        }
        await handler(job.data as JobPayload)
      },
      { connection }
    )

    worker.on("failed", (job, err) => {
      logger.error({ err, job: job?.name }, "job failed")
    })
  }

  return {
    register<T extends JobPayload>(name: string, handler: JobHandler<T>) {
      handlers.set(name, handler as JobHandler)
      ensureWorker()
    },

    enqueue<T extends JobPayload>(name: string, payload: T) {
      void queue.add(name, payload).catch((err) => {
        logger.error({ err, job: name }, "failed to enqueue job")
      })
    },

    async close() {
      await worker?.close()
      await queue.close()
    },
  }
}
