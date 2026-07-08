import { Global, Module, type OnModuleInit } from "@nestjs/common"
import { BullModule } from "@nestjs/bullmq"
import { ScheduleModule } from "@nestjs/schedule"
import { jobsEnv } from "@workspace/config/jobs"
import { createLogger } from "@workspace/logger"

const logger = createLogger("Jobs")

@Global()
@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      useFactory: () => {
        const url = new URL(jobsEnv.REDIS_URL)
        return {
          connection: {
            host: url.hostname,
            port: parseInt(url.port, 10) || 6379,
            username: url.username || undefined,
            password: url.password || undefined,
            maxRetriesPerRequest: null,
            retryStrategy: (times) => {
              if (process.env.NODE_ENV === "test") return null
              return Math.max(Math.min(Math.exp(times), 20000), 1000)
            },
          },
        }
      },
    }),
    BullModule.registerQueue({
      name: jobsEnv.JOBS_QUEUE_NAME,
    }),
  ],
  exports: [BullModule],
})
export class JobsModule implements OnModuleInit {
  onModuleInit() {
    logger.info({ provider: jobsEnv.JOBS_PROVIDER }, "job queue ready")
  }
}
