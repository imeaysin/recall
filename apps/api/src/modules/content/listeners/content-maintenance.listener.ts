import { Injectable } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { createLogger } from "@workspace/logger"
import { ContentService } from "../content.service"

@Injectable()
export class ContentMaintenanceListener {
  private readonly logger = createLogger("ContentMaintenance")

  constructor(private readonly contentService: ContentService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async purgeExpiredTrash(): Promise<void> {
    const purged = await this.contentService.purgeExpiredTrash()
    if (purged > 0) {
      this.logger.info({ purged }, "purged expired soft-deleted content")
    }
  }
}
