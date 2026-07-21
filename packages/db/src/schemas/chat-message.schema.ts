import mongoose, { Schema, type Document, type Types } from "mongoose"

export type ChatMessageCitation = {
  contentId: Types.ObjectId
  title: string
  sourceUrl?: string
  chunkText: string
}

export interface IChatMessage extends Document {
  _id: Types.ObjectId
  chatId: Types.ObjectId
  userId: string
  role: "user" | "assistant"
  text: string
  citations: ChatMessageCitation[]
  retrievedChunkIds: Types.ObjectId[]
  tokensUsed?: number
  createdAt: Date
}

const CitationSchema = new Schema<ChatMessageCitation>(
  {
    contentId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    sourceUrl: { type: String },
    chunkText: { type: String, required: true },
  },
  { _id: false }
)

export const ChatMessageSchema = new Schema<IChatMessage>({
  chatId: { type: Schema.Types.ObjectId, required: true },
  userId: { type: String, required: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  text: { type: String, required: true },
  citations: { type: [CitationSchema], required: true, default: [] },
  retrievedChunkIds: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
  },
  tokensUsed: { type: Number },
  createdAt: { type: Date, required: true, default: Date.now },
})

ChatMessageSchema.index({ chatId: 1, createdAt: 1 })

export const ChatMessageModel = mongoose.models.ChatMessage
  ? mongoose.model<IChatMessage>("ChatMessage")
  : mongoose.model<IChatMessage>(
      "ChatMessage",
      ChatMessageSchema,
      "chat_messages"
    )
