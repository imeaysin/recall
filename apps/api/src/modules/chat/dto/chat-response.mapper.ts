import type { ChatCitation, ChatMessageResponse } from "@workspace/contracts"
import type {
  ChatEntity,
  ChatMessageCitationEntity,
  ChatMessageEntity,
  ContentCitationMeta,
} from "../domain"
import { buildLanguageCaveat } from "../domain"

export function toChatResponse(entity: ChatEntity) {
  return {
    id: entity.id,
    userId: entity.userId,
    title: entity.title,
    lastMessageAt: entity.lastMessageAt.toISOString(),
    messageCount: entity.messageCount,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  }
}

export function toChatMessageResponse(input: {
  readonly message: ChatMessageEntity
  readonly contentMeta: ReadonlyMap<string, ContentCitationMeta>
  readonly languageCaveatOverride?: string
}): ChatMessageResponse {
  const citations = input.message.citations.map((citation) =>
    toChatCitation(citation, input.contentMeta.get(citation.contentId))
  )
  const languageCaveat =
    input.languageCaveatOverride ??
    (input.message.role === "assistant"
      ? buildLanguageCaveat(
          [...input.contentMeta.values()].map((meta) => meta.language)
        )
      : undefined)
  return {
    id: input.message.id,
    chatId: input.message.chatId,
    role: input.message.role,
    text: input.message.text,
    citations,
    languageCaveat,
    tokensUsed: input.message.tokensUsed,
    createdAt: input.message.createdAt.toISOString(),
  }
}

export function toChatCitation(
  citation: ChatMessageCitationEntity,
  meta: ContentCitationMeta | undefined
): ChatCitation {
  const sourceRemoved = meta === undefined || meta.missing || meta.isDeleted
  return {
    contentId: citation.contentId,
    title: citation.title,
    sourceUrl: citation.sourceUrl,
    chunkText: citation.chunkText,
    sourceRemoved,
  }
}

export function collectCitationContentIds(
  messages: readonly ChatMessageEntity[]
): readonly string[] {
  const ids = messages.flatMap((message) =>
    message.citations.map((citation) => citation.contentId)
  )
  return [...new Set(ids)]
}
