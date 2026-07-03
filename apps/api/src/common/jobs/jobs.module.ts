import {
  Global,
  Inject,
  Module,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common"
import { jobsEnv } from "@workspace/config/jobs"
import { createJobQueue, type JobQueue } from "@workspace/jobs"
import { createLogger } from "@workspace/logger"
import { registerJobHandlers } from "./job-handlers"

export const JOB_QUEUE = Symbol("JOB_QUEUE")

function createJobQueueProvider(): JobQueue {
  if (jobsEnv.JOBS_PROVIDER === "redis") {
    return createJobQueue({
      provider: "redis",
      redisUrl: jobsEnv.REDIS_URL,
      queueName: jobsEnv.JOBS_QUEUE_NAME,
    })
  }

  return createJobQueue({ provider: "inline" })
}

@Global()
@Module({
  providers: [{ provide: JOB_QUEUE, useFactory: createJobQueueProvider }],
  exports: [JOB_QUEUE],
})
export class JobsModule implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(JOB_QUEUE) private readonly jobQueue: JobQueue) {}

  onModuleInit() {
    registerJobHandlers(this.jobQueue)
    createLogger("Jobs").info(
      { provider: jobsEnv.JOBS_PROVIDER },
      "job queue ready"
    )
  }

  onModuleDestroy() {
    void this.jobQueue.close()
  }
}
