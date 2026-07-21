import { Injectable } from "@nestjs/common"
import { isValidObjectId } from "mongoose"
import { ChatModel, type IChat } from "@workspace/db"
import type { ChatEntity } from "../domain"
import { mapChatDoc } from "./chat.mapper"

@Injectable()
export class ChatQueryRepository {
  async findActiveByIdForUser(input: {
    readonly userId: string
    readonly chatId: string
  }): Promise<ChatEntity | null> {
    if (!isValidObjectId(input.chatId)) return null
    const doc = await ChatModel.findOne({
      _id: input.chatId,
      userId: input.userId,
      isDeleted: false,
    }).lean<IChat>()
    return doc ? mapChatDoc(doc) : null
  }

  async listActiveForUser(userId: string): Promise<readonly ChatEntity[]> {
    const docs = await ChatModel.find({
      userId,
      isDeleted: false,
    })
      .sort({ lastMessageAt: -1 })
      .lean<IChat[]>()
    return docs.map(mapChatDoc)
  }
}
