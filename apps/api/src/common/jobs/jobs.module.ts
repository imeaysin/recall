import { Global, Module, type OnModuleInit } from "@nestjs/common"
import { ScheduleModule } from "@nestjs/schedule"
import { createLogger } from "@workspace/logger"

const logger = createLogger("Jobs")

/**
 * CogniVault jobs (plan 2A / NFR-5.2):
 * ScheduleModule only — no BullMQ/Redis.
 * Ingestion uses Mongo atomic claim + EventEmitter2 + cron scanners.
 */
@Global()
@Module({
  imports: [ScheduleModule.forRoot()],
  exports: [ScheduleModule],
})
export class JobsModule implements OnModuleInit {
  onModuleInit() {
    logger.info(
      { provider: "schedule" },
      "job scheduler ready (no Redis queue)"
    )
  }
}
