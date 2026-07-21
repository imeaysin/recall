import type { IChat } from "@workspace/db"
import type { ChatEntity } from "../domain"

export function mapChatDoc(doc: IChat): ChatEntity {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    title: doc.title,
    lastMessageAt: doc.lastMessageAt,
    messageCount: doc.messageCount,
    isDeleted: doc.isDeleted,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}
