export const CHAT_PROMPT_SUGGESTIONS: readonly string[] = [
  "Summarize what I've saved recently",
  "What are the key themes in my library?",
  "Find contradictions across my notes",
]

export const CHAT_INPUT_PLACEHOLDER = "Ask anything... type @ to add context"

export const CHAT_TITLE_MAX_LENGTH = 120
export const CHAT_CREATE_TITLE_MAX_LENGTH = 80
export const CHAT_MESSAGES_PAGE_LIMIT = 100

export const CHAT_FALLBACK_TITLE = "Chat"
export const CHAT_DEFAULT_CITATION_LABEL = "Library item"

export const CHAT_CREATE_ERROR = "Failed to start chat"
export const CHAT_SEND_ERROR = "Failed to send message"
export const CHAT_MISSING_ID_MESSAGE = "Missing chat id."
export const CHAT_DELETE_CONFIRM = "Delete this chat permanently?"

export const CHAT_QUERY_ROOT = "chats"
export const CHAT_QUERY_LIST = "list"
export const CHAT_QUERY_MESSAGES = "messages"

export const CHAT_PAGE_SHELL_CLASS =
  "relative h-full min-h-0 flex-1 gap-0 overflow-hidden p-0"

export enum ChatMessageRole {
  User = "user",
  Assistant = "assistant",
}
