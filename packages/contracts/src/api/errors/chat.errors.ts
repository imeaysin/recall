export const ChatErrorCode = {
  CHAT_NOT_FOUND: "CHAT.NOT_FOUND",
  CHAT_MESSAGE_INVALID: "CHAT.MESSAGE_INVALID",
} as const

export type ChatErrorCode = (typeof ChatErrorCode)[keyof typeof ChatErrorCode]
