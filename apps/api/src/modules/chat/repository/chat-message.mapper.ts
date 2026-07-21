import type {
  ChatMessageCitation,
  IChatMessage,
  IVectorChunk,
} from "@workspace/db"
import type {
  ChatMessageCitationEntity,
  ChatMessageEntity,
  VectorChunkEntity,
} from "../domain"

export function mapChatMessageDoc(doc: IChatMessage): ChatMessageEntity {
  return {
    id: doc._id.toString(),
    chatId: doc.chatId.toString(),
    userId: doc.userId,
    role: doc.role,
    text: doc.text,
    citations: doc.citations.map(mapCitationDoc),
    retrievedChunkIds: doc.retrievedChunkIds.map((id) => id.toString()),
    tokensUsed: doc.tokensUsed,
    createdAt: doc.createdAt,
  }
}

function mapCitationDoc(
  citation: ChatMessageCitation
): ChatMessageCitationEntity {
  return {
    contentId: citation.contentId.toString(),
    title: citation.title,
    sourceUrl: citation.sourceUrl,
    chunkText: citation.chunkText,
  }
}

export function mapVectorChunkDoc(doc: IVectorChunk): VectorChunkEntity {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    contentId: doc.contentId.toString(),
    chunkIndex: doc.chunkIndex,
    text: doc.text,
    embedding: doc.embedding,
  }
}
