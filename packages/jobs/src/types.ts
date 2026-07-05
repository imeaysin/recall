export type JobPayload = Record<string, unknown>

export type JobHandler<T extends JobPayload = JobPayload> = (
  payload: T
) => Promise<void> | void

export type JobQueue = {
  register<T extends JobPayload>(name: string, handler: JobHandler<T>): void
  enqueue<T extends JobPayload>(name: string, payload: T): void
  close(): Promise<void>
}

export type InlineJobQueueConfig = {
  provider: "inline"
}

export type RedisJobQueueConfig = {
  provider: "redis"
  redisUrl: string
  queueName?: string
}

export type JobQueueConfig = InlineJobQueueConfig | RedisJobQueueConfig
