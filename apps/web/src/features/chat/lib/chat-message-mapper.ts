import type { ChatMessageResponse } from "@workspace/contracts"
import type { Message } from "@workspace/ui/components/ai/chat-message"
import {
  CHAT_DEFAULT_CITATION_LABEL,
  ChatMessageRole,
} from "@/features/chat/constants"

function citationLabel(
  citation: ChatMessageResponse["citations"][number]
): string {
  if (citation.title.length > 0) return citation.title
  if (citation.sourceUrl !== undefined && citation.sourceUrl.length > 0) {
    return citation.sourceUrl
  }
  return CHAT_DEFAULT_CITATION_LABEL
}

function formatCitationLine(
  citation: ChatMessageResponse["citations"][number],
  index: number
): string {
  const removed = citation.sourceRemoved ? " _(removed)_" : ""
  const label = citationLabel(citation)
  return `${index + 1}. **${label}**${removed} — ${citation.chunkText}`
}

function citationAppendix(message: ChatMessageResponse): readonly string[] {
  if (message.citations.length === 0) return []
  return [
    "",
    ...message.citations.map((citation, index) =>
      formatCitationLine(citation, index)
    ),
  ]
}

function caveatAppendix(message: ChatMessageResponse): readonly string[] {
  if (!message.languageCaveat) return []
  return ["", `_${message.languageCaveat}_`]
}

export function toUiMessage(message: ChatMessageResponse): Message {
  return {
    id: message.id,
    role: message.role,
    content: [
      message.text,
      ...caveatAppendix(message),
      ...citationAppendix(message),
    ].join("\n"),
    createdAt: new Date(message.createdAt),
  }
}

export function hasServerUserText(config: {
  readonly items: readonly ChatMessageResponse[]
  readonly text: string
}): boolean {
  return config.items.some(
    (message) =>
      message.role === ChatMessageRole.User && message.text === config.text
  )
}

export function createOptimisticUserMessage(config: {
  readonly chatId: string
  readonly text: string
}): Message {
  return {
    id: `optimistic-user-${config.chatId}`,
    role: ChatMessageRole.User,
    content: config.text,
    createdAt: new Date(),
  }
}

export function mergeOptimisticMessages(config: {
  readonly chatId: string
  readonly serverItems: readonly ChatMessageResponse[]
  readonly serverMessages: readonly Message[]
  readonly inflightText: string | null
  readonly streamingAssistantText: string | null
}): Message[] {
  const { chatId, serverItems, serverMessages, inflightText } = config
  let messages = [...serverMessages]
  if (
    inflightText &&
    !hasServerUserText({ items: serverItems, text: inflightText })
  ) {
    messages = [
      ...messages,
      createOptimisticUserMessage({ chatId, text: inflightText }),
    ]
  }
  if (
    config.streamingAssistantText !== null &&
    config.streamingAssistantText.length > 0
  ) {
    const lastServer = serverMessages.at(-1)
    if (lastServer?.role !== ChatMessageRole.Assistant) {
      messages = [
        ...messages,
        {
          id: `optimistic-assistant-${chatId}`,
          role: ChatMessageRole.Assistant,
          content: config.streamingAssistantText,
          createdAt: new Date(),
        },
      ]
    }
  }
  return messages
}

export function resolveErrorMessage(config: {
  readonly error: Error
  readonly fallback: string
}): string {
  const message = config.error.message.trim()
  if (message.length === 0) return config.fallback
  return message
}
