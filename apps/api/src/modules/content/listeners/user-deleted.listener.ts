import { Injectable, Logger } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { AppEvents } from "@/common/events"
import { UserDeletedEvent } from "@/modules/users/events/user-deleted.event"
import { ContentService } from "../content.service"

@Injectable()
export class UserDeletedListener {
  private readonly logger = new Logger(UserDeletedListener.name)

  constructor(private readonly contentService: ContentService) {}

  @OnEvent(AppEvents.USER_DELETED, { async: true })
  async handleUserDeletedEvent(event: UserDeletedEvent): Promise<void> {
    this.logger.log(
      `Received account teardown signal for user ID: ${event.userId}`
    )

    try {
      await this.contentService.purgeAllForUser(event.userId)
      this.logger.log(
        `Successfully completed cascade content deletion for user ID: ${event.userId}`
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      const stack = error instanceof Error ? error.stack : undefined
      this.logger.error(
        `Critical: Failed cascade purge of content for user ${event.userId}. Root cause: ${message}`,
        stack
      )
    }
  }
}
