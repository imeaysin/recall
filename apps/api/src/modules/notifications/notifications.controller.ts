import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger"
import type { JwtClaims } from "@workspace/auth/types"
import { CurrentUser } from "@/common/decorators"
import { ApiAuthErrorResponses } from "@/common/decorators/api-error-responses.decorator"
import { NotificationsService } from "./notifications.service"
import {
  RegisterDeviceTokenDto,
  UnregisterDeviceTokenDto,
  NotificationListApiResponseDto,
  UnreadCountApiResponseDto,
} from "./dto"

@ApiTags("notifications")
@ApiAuthErrorResponses()
@Controller({ path: "notifications", version: "1" })
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiBearerAuth("bearer")
  @ApiOperation({
    summary: "List notifications",
    description:
      "Returns recent in-app notifications for the authenticated user.",
  })
  @ApiOkResponse({ type: NotificationListApiResponseDto })
  list(@CurrentUser() user: JwtClaims) {
    return this.notificationsService.listNotifications({ userId: user.id })
  }

  @Get("unread-count")
  @ApiBearerAuth("bearer")
  @ApiOperation({
    summary: "Get unread count",
    description: "Returns the count of unread notifications.",
  })
  @ApiOkResponse({ type: UnreadCountApiResponseDto })
  unreadCount(@CurrentUser() user: JwtClaims) {
    return this.notificationsService.countUnread({ userId: user.id })
  }

  @Post(":id/read")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth("bearer")
  @ApiOperation({
    summary: "Mark as read",
    description: "Marks a single notification as read.",
  })
  @ApiParam({
    name: "id",
    description: "Notification id",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiNoContentResponse({ description: "Marked as read" })
  markRead(@CurrentUser() user: JwtClaims, @Param("id") id: string) {
    return this.notificationsService.markAsRead({
      userId: user.id,
      notificationId: id,
    })
  }

  @Post("read-all")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth("bearer")
  @ApiOperation({
    summary: "Mark all as read",
    description: "Marks all unread notifications as read for the user.",
  })
  @ApiNoContentResponse({ description: "All marked as read" })
  markAllRead(@CurrentUser() user: JwtClaims) {
    return this.notificationsService.markAllAsRead({ userId: user.id })
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth("bearer")
  @ApiOperation({
    summary: "Delete a notification",
    description: "Permanently deletes a notification owned by the user.",
  })
  @ApiParam({
    name: "id",
    description: "Notification id",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiNoContentResponse({ description: "Notification deleted" })
  remove(@CurrentUser() user: JwtClaims, @Param("id") id: string) {
    return this.notificationsService.deleteNotification({
      userId: user.id,
      notificationId: id,
    })
  }

  @Post("device-tokens")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth("bearer")
  @ApiOperation({
    summary: "Register device token",
    description:
      "Registers an Expo push token for the authenticated user. " +
      "Upserts — if the token already exists it is reassigned to this user.",
  })
  @ApiNoContentResponse({ description: "Token registered" })
  registerToken(
    @CurrentUser() user: JwtClaims,
    @Body() body: RegisterDeviceTokenDto
  ) {
    return this.notificationsService.registerDeviceToken({
      userId: user.id,
      ...body,
    })
  }

  @Post("device-tokens/unregister")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth("bearer")
  @ApiOperation({
    summary: "Unregister device token",
    description: "Removes a previously registered push token.",
  })
  @ApiNoContentResponse({ description: "Token removed" })
  unregisterToken(
    @CurrentUser() user: JwtClaims,
    @Body() body: UnregisterDeviceTokenDto
  ) {
    return this.notificationsService.unregisterDeviceToken(user.id, body.token)
  }
}
