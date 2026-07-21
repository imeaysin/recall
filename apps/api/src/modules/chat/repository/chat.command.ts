import { Injectable } from "@nestjs/common"
import { isValidObjectId, Types } from "mongoose"
import { ChatModel } from "@workspace/db"
import { DEFAULT_CHAT_TITLE } from "../domain"
import type { ChatEntity } from "../domain"
import { mapChatDoc } from "./chat.mapper"

@Injectable()
export class ChatCommandRepository {
  async create(input: {
    readonly userId: string
    readonly title?: string
  }): Promise<ChatEntity> {
    const now = new Date()
    const doc = await ChatModel.create({
      userId: input.userId,
      title: input.title ?? DEFAULT_CHAT_TITLE,
      lastMessageAt: now,
      messageCount: 0,
      isDeleted: false,
    })
    return mapChatDoc(doc)
  }

  async rename(input: {
    readonly userId: string
    readonly chatId: string
    readonly title: string
  }): Promise<ChatEntity | null> {
    if (!isValidObjectId(input.chatId)) return null
    const doc = await ChatModel.findOneAndUpdate(
      { _id: input.chatId, userId: input.userId, isDeleted: false },
      { $set: { title: input.title } },
      { returnDocument: "after" }
    )
    return doc ? mapChatDoc(doc) : null
  }

  async softDelete(input: {
    readonly userId: string
    readonly chatId: string
  }): Promise<boolean> {
    if (!isValidObjectId(input.chatId)) return false
    const result = await ChatModel.updateOne(
      { _id: input.chatId, userId: input.userId, isDeleted: false },
      { $set: { isDeleted: true } }
    )
    return result.modifiedCount > 0
  }

  async bumpAfterMessages(input: {
    readonly userId: string
    readonly chatId: string
    readonly addedCount: number
    readonly lastMessageAt: Date
    readonly title?: string
  }): Promise<ChatEntity | null> {
    if (!isValidObjectId(input.chatId)) return null
    const update: Record<string, Date | number | string> = {
      lastMessageAt: input.lastMessageAt,
    }
    const inc = { messageCount: input.addedCount }
    if (input.title) {
      update.title = input.title
    }
    const doc = await ChatModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(input.chatId),
        userId: input.userId,
        isDeleted: false,
      },
      { $set: update, $inc: inc },
      { returnDocument: "after" }
    )
    return doc ? mapChatDoc(doc) : null
  }
}
