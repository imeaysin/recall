import { Module } from "@nestjs/common"
import { NotificationsController } from "./notifications.controller"
import { NotificationsService } from "./notifications.service"
import { NotificationQueryRepository } from "./repository/notification.query"
import { NotificationCommandRepository } from "./repository/notification.command"

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationQueryRepository,
    NotificationCommandRepository,
    NotificationsService,
  ],
})
export class NotificationsModule {}
