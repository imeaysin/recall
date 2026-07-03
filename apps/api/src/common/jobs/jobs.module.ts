import { Global, Inject, Module, type OnModuleInit } from "@nestjs/common"
import { createJobQueue, type JobQueue } from "@workspace/jobs"
import { createLogger } from "@workspace/logger"
import { registerJobHandlers } from "./job-handlers"

export const JOB_QUEUE = Symbol("JOB_QUEUE")

@Global()
@Module({
  providers: [
    {
      provide: JOB_QUEUE,
      useFactory: (): JobQueue => createJobQueue({ provider: "inline" }),
    },
  ],
  exports: [JOB_QUEUE],
})
export class JobsModule implements OnModuleInit {
  constructor(@Inject(JOB_QUEUE) private readonly jobQueue: JobQueue) {}

  onModuleInit() {
    registerJobHandlers(this.jobQueue)
    createLogger("Jobs").info("inline job queue ready")
  }
}
