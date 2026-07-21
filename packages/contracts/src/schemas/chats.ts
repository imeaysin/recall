import { z } from "zod"
import { apiSuccessResponse } from "../api/envelopes"

export const ChatCitationSchema = z
  .object({
    contentId: z.string(),
    title: z.string(),
    sourceUrl: z.string().optional(),
    chunkText: z.string(),
    sourceRemoved: z.boolean(),
  })
  .meta({ id: "ChatCitationDto" })

export const ChatResponseSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    lastMessageAt: z.string(),
    messageCount: z.number().int().nonnegative(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .meta({
    id: "ChatResponseDto",
    title: "Chat",
    description: "A RAG conversation for the current user.",
  })

export const ChatMessageResponseSchema = z
  .object({
    id: z.string(),
    chatId: z.string(),
    role: z.enum(["user", "assistant"]),
    text: z.string(),
    citations: z.array(ChatCitationSchema),
    languageCaveat: z.string().optional(),
    tokensUsed: z.number().optional(),
    createdAt: z.string(),
  })
  .meta({ id: "ChatMessageResponseDto" })

export const CreateChatSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
  })
  .strict()
  .meta({ id: "CreateChatDto" })

export const UpdateChatSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
  })
  .strict()
  .meta({ id: "UpdateChatDto" })

export const SendChatMessageSchema = z
  .object({
    text: z.string().trim().min(1).max(8000),
    contentId: z.string().min(1).optional().meta({
      description:
        "When set, retrieval is scoped to a single library item (summarize/ask).",
    }),
  })
  .strict()
  .meta({ id: "SendChatMessageDto" })

export const ChatMessagesQuerySchema = z
  .object({
    limit: z.coerce.number().int().positive().max(100).optional(),
    before: z.string().optional(),
  })
  .strict()
  .meta({ id: "ChatMessagesQueryDto" })

export const ChatListResponseSchema = z
  .object({
    items: z.array(ChatResponseSchema),
  })
  .meta({ id: "ChatListResponseDto" })

export const ChatMessagesResponseSchema = z
  .object({
    items: z.array(ChatMessageResponseSchema),
  })
  .meta({ id: "ChatMessagesResponseDto" })

export const SendChatMessageResponseSchema = z
  .object({
    userMessage: ChatMessageResponseSchema,
    assistantMessage: ChatMessageResponseSchema,
  })
  .meta({ id: "SendChatMessageResponseDto" })

export const ChatApiResponseSchema = apiSuccessResponse(ChatResponseSchema, {
  id: "ChatApiResponseDto",
  title: "Chat response",
})

export const ChatListApiResponseSchema = apiSuccessResponse(
  ChatListResponseSchema,
  {
    id: "ChatListApiResponseDto",
    title: "Chat list response",
  }
)

export const ChatMessagesApiResponseSchema = apiSuccessResponse(
  ChatMessagesResponseSchema,
  {
    id: "ChatMessagesApiResponseDto",
    title: "Chat messages response",
  }
)

export const SendChatMessageApiResponseSchema = apiSuccessResponse(
  SendChatMessageResponseSchema,
  {
    id: "SendChatMessageApiResponseDto",
    title: "Send chat message response",
  }
)

export type ChatResponse = z.infer<typeof ChatResponseSchema>
export type ChatMessageResponse = z.infer<typeof ChatMessageResponseSchema>
export type ChatCitation = z.infer<typeof ChatCitationSchema>
export type CreateChat = z.infer<typeof CreateChatSchema>
export type UpdateChat = z.infer<typeof UpdateChatSchema>
export type SendChatMessage = z.infer<typeof SendChatMessageSchema>
export type ChatMessagesQuery = z.infer<typeof ChatMessagesQuerySchema>
export type ChatListResponse = z.infer<typeof ChatListResponseSchema>
export type ChatMessagesResponse = z.infer<typeof ChatMessagesResponseSchema>
export type SendChatMessageResponse = z.infer<
  typeof SendChatMessageResponseSchema
>
