import {
  ChatApiResponseSchema,
  ChatListApiResponseSchema,
  ChatMessagesApiResponseSchema,
  CreateChatSchema,
  SendChatMessageApiResponseSchema,
  SendChatMessageSchema,
  UpdateChatSchema,
  ChatMessagesQuerySchema,
} from "@workspace/contracts"
import { createZodDto } from "nestjs-zod"

export class CreateChatDto extends createZodDto(CreateChatSchema) {}
export class UpdateChatDto extends createZodDto(UpdateChatSchema) {}
export class SendChatMessageDto extends createZodDto(SendChatMessageSchema) {}
export class ChatMessagesQueryDto extends createZodDto(
  ChatMessagesQuerySchema
) {}

export class ChatApiResponseDto extends createZodDto(ChatApiResponseSchema) {}
export class ChatListApiResponseDto extends createZodDto(
  ChatListApiResponseSchema
) {}
export class ChatMessagesApiResponseDto extends createZodDto(
  ChatMessagesApiResponseSchema
) {}
export class SendChatMessageApiResponseDto extends createZodDto(
  SendChatMessageApiResponseSchema
) {}
