import type { ChatCitation, SendChatMessage } from "@workspace/contracts"
import type { RagCitation } from "@workspace/ai"
import type {
  ChatMessageCitationEntity,
  ContentCitationMeta,
  VectorChunkEntity,
} from "../domain"

export function buildRagCitations(input: {
  readonly chunks: readonly VectorChunkEntity[]
  readonly contentMeta: ReadonlyMap<string, ContentCitationMeta>
}): readonly RagCitation[] {
  return input.chunks.map((chunk) => {
    const meta = input.contentMeta.get(chunk.contentId)
    const title = resolveCitationTitle(meta, chunk.contentId)
    return {
      contentId: chunk.contentId,
      title,
      sourceUrl: meta?.sourceUrl,
      chunkText: chunk.text,
    }
  })
}

export function buildStoredCitations(input: {
  readonly ragCitations: readonly RagCitation[]
  readonly contentMeta: ReadonlyMap<string, ContentCitationMeta>
}): readonly ChatMessageCitationEntity[] {
  return input.ragCitations.map((citation) => ({
    contentId: citation.contentId,
    title: citation.title,
    sourceUrl: citation.sourceUrl,
    chunkText: citation.chunkText,
  }))
}

export function buildResponseCitations(input: {
  readonly stored: readonly ChatMessageCitationEntity[]
  readonly contentMeta: ReadonlyMap<string, ContentCitationMeta>
}): readonly ChatCitation[] {
  return input.stored.map((citation) => {
    const meta = input.contentMeta.get(citation.contentId)
    const sourceRemoved = meta === undefined || meta.missing || meta.isDeleted
    return {
      contentId: citation.contentId,
      title: citation.title,
      sourceUrl: citation.sourceUrl,
      chunkText: citation.chunkText,
      sourceRemoved,
    }
  })
}

function resolveCitationTitle(
  meta: ContentCitationMeta | undefined,
  contentId: string
): string {
  if (meta?.title && meta.title.trim().length > 0) return meta.title
  if (meta?.missing || meta?.isDeleted) return "Removed source"
  return contentId
}

export function collectContentIdsFromChunks(
  chunks: readonly VectorChunkEntity[]
): readonly string[] {
  return [...new Set(chunks.map((chunk) => chunk.contentId))]
}

export function mergeContentMetaMaps(
  maps: readonly ReadonlyMap<string, ContentCitationMeta>[]
): ReadonlyMap<string, ContentCitationMeta> {
  const merged = new Map<string, ContentCitationMeta>()
  for (const map of maps) {
    for (const [key, value] of map.entries()) {
      merged.set(key, value)
    }
  }
  return merged
}

export type SendMessageScope = {
  readonly userId: string
  readonly chatId: string
  readonly body: SendChatMessage
}
