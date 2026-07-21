import { Injectable } from "@nestjs/common"
import { isValidObjectId, Types } from "mongoose"
import { ChatMessageModel, type IChatMessage } from "@workspace/db"
import type { ChatMessagesQuery } from "@workspace/contracts"
import type { ChatMessageEntity } from "../domain"
import {
  CHAT_CONTEXT_MESSAGE_LIMIT,
  CHAT_MESSAGES_DEFAULT_LIMIT,
} from "../domain"
import { mapChatMessageDoc } from "./chat-message.mapper"

@Injectable()
export class ChatMessageQueryRepository {
  async findByIdForChat(input: {
    readonly chatId: string
    readonly messageId: string
  }): Promise<ChatMessageEntity | null> {
    if (!isValidObjectId(input.chatId) || !isValidObjectId(input.messageId)) {
      return null
    }
    const doc = await ChatMessageModel.findOne({
      _id: input.messageId,
      chatId: input.chatId,
    }).lean<IChatMessage>()
    return doc ? mapChatMessageDoc(doc) : null
  }

  async listPage(input: {
    readonly chatId: string
    readonly query: ChatMessagesQuery
  }): Promise<readonly ChatMessageEntity[]> {
    if (!isValidObjectId(input.chatId)) return []
    const limit = input.query.limit ?? CHAT_MESSAGES_DEFAULT_LIMIT
    const filter: { chatId: Types.ObjectId; createdAt?: { $lt: Date } } = {
      chatId: new Types.ObjectId(input.chatId),
    }
    if (input.query.before) {
      if (!isValidObjectId(input.query.before)) return []
      const cursor = await this.findByIdForChat({
        chatId: input.chatId,
        messageId: input.query.before,
      })
      if (!cursor) return []
      filter.createdAt = { $lt: cursor.createdAt }
    }
    const docs = await ChatMessageModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<IChatMessage[]>()
    return [...docs].reverse().map(mapChatMessageDoc)
  }

  async listRecentForContext(input: {
    readonly chatId: string
    readonly limit: number
  }): Promise<readonly ChatMessageEntity[]> {
    if (!isValidObjectId(input.chatId)) return []
    const docs = await ChatMessageModel.find({
      chatId: new Types.ObjectId(input.chatId),
    })
      .sort({ createdAt: -1 })
      .limit(input.limit)
      .lean<IChatMessage[]>()
    return [...docs].reverse().map(mapChatMessageDoc)
  }

  async listContextBeforeSend(
    chatId: string
  ): Promise<readonly ChatMessageEntity[]> {
    return this.listRecentForContext({
      chatId,
      limit: CHAT_CONTEXT_MESSAGE_LIMIT,
    })
  }
}
