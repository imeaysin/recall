import { Injectable } from "@nestjs/common"
import { isValidObjectId, Types } from "mongoose"
import {
  ChatMessageModel,
  type ChatMessageCitation,
  type IChatMessage,
} from "@workspace/db"
import type { ChatMessageCitationEntity, ChatMessageEntity } from "../domain"
import { mapChatMessageDoc } from "./chat-message.mapper"

type InsertMessageInput = {
  readonly chatId: string
  readonly userId: string
  readonly role: "user" | "assistant"
  readonly text: string
  readonly citations?: readonly ChatMessageCitationEntity[]
  readonly retrievedChunkIds?: readonly string[]
  readonly tokensUsed?: number
}

@Injectable()
export class ChatMessageCommandRepository {
  async insert(input: InsertMessageInput): Promise<ChatMessageEntity> {
    const citations = (input.citations ?? []).map(toDbCitation)
    const retrievedChunkIds = (input.retrievedChunkIds ?? [])
      .filter(isValidObjectId)
      .map((id) => new Types.ObjectId(id))
    const doc = await ChatMessageModel.create({
      chatId: new Types.ObjectId(input.chatId),
      userId: input.userId,
      role: input.role,
      text: input.text,
      citations,
      retrievedChunkIds,
      tokensUsed: input.tokensUsed,
      createdAt: new Date(),
    })
    return mapChatMessageDoc(doc)
  }
}

function toDbCitation(
  citation: ChatMessageCitationEntity
): ChatMessageCitation {
  return {
    contentId: new Types.ObjectId(citation.contentId),
    title: citation.title,
    sourceUrl: citation.sourceUrl,
    chunkText: citation.chunkText,
  }
}
