export type JobPayload = Record<string, unknown>

export type JobHandler<T extends JobPayload = JobPayload> = (
  payload: T
) => Promise<void> | void

export interface JobQueue {
  register<T extends JobPayload>(name: string, handler: JobHandler<T>): void
  enqueue<T extends JobPayload>(name: string, payload: T): void
}

export type JobQueueConfig = {
  provider: "inline"
}
