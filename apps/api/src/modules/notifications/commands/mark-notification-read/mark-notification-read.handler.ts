import { CommandHandler, type ICommandHandler } from "@nestjs/cqrs"
import { NotificationErrorCode } from "@workspace/contracts"
import { apiNotFound } from "@/common/exceptions/api.exception"
import { NotificationRepository } from "../../repositories/notification.repository"
import { MarkNotificationReadCommand } from "./mark-notification-read.command"

@CommandHandler(MarkNotificationReadCommand)
export class MarkNotificationReadHandler implements ICommandHandler<MarkNotificationReadCommand> {
  constructor(private readonly notifications: NotificationRepository) {}

  async execute(command: MarkNotificationReadCommand): Promise<void> {
    const updated = await this.notifications.markAsRead(command.scope)
    if (!updated) {
      apiNotFound("Notification not found", NotificationErrorCode.NOT_FOUND)
    }
  }
}
