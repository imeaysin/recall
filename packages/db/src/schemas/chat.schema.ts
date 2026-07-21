import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface IChat extends Document {
  _id: Types.ObjectId
  userId: string
  title: string
  lastMessageAt: Date
  messageCount: number
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

export const ChatSchema = new Schema<IChat>(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true, default: "New Chat" },
    lastMessageAt: { type: Date, required: true, default: Date.now },
    messageCount: { type: Number, required: true, default: 0 },
    isDeleted: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
)

ChatSchema.index({ userId: 1, isDeleted: 1, lastMessageAt: -1 })

export const ChatModel = mongoose.models.Chat
  ? mongoose.model<IChat>("Chat")
  : mongoose.model<IChat>("Chat", ChatSchema, "chats")
