import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface IVectorChunk extends Document {
  _id: Types.ObjectId
  userId: string
  contentId: Types.ObjectId
  chunkIndex: number
  text: string
  tokenCount: number
  embedding: number[]
  embeddingModel: string
  createdAt: Date
}

export const VectorChunkSchema = new Schema<IVectorChunk>({
  userId: { type: String, required: true, index: true },
  contentId: { type: Schema.Types.ObjectId, required: true, index: true },
  chunkIndex: { type: Number, required: true },
  text: { type: String, required: true },
  tokenCount: { type: Number, required: true },
  embedding: { type: [Number], required: true },
  embeddingModel: {
    type: String,
    required: true,
    default: "gemini-embedding-2",
  },
  createdAt: { type: Date, required: true, default: Date.now },
})

VectorChunkSchema.index({ contentId: 1, chunkIndex: 1 })

export const VectorChunkModel = mongoose.models.VectorChunk
  ? mongoose.model<IVectorChunk>("VectorChunk")
  : mongoose.model<IVectorChunk>(
      "VectorChunk",
      VectorChunkSchema,
      "vector_chunks"
    )
