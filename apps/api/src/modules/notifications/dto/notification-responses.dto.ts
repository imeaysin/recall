import {
  NotificationListApiResponseSchema,
  UnreadCountApiResponseSchema,
} from "@workspace/contracts"
import { createZodDto } from "nestjs-zod"

export class NotificationListApiResponseDto extends createZodDto(
  NotificationListApiResponseSchema
) {}

export class UnreadCountApiResponseDto extends createZodDto(
  UnreadCountApiResponseSchema
) {}
