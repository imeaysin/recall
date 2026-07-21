import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface IContentTrash extends Document {
  _id: Types.ObjectId
  originalContentId: Types.ObjectId
  userId: string
  snapshot: object
  deletedAt: Date
  purgeAt: Date
}

export const ContentTrashSchema = new Schema<IContentTrash>({
  originalContentId: { type: Schema.Types.ObjectId, required: true },
  userId: { type: String, required: true },
  snapshot: { type: Schema.Types.Mixed, required: true },
  deletedAt: { type: Date, required: true, default: Date.now },
  purgeAt: { type: Date, required: true },
})

ContentTrashSchema.index({ purgeAt: 1 }, { expireAfterSeconds: 0 })
ContentTrashSchema.index({ userId: 1, deletedAt: -1 })

export const ContentTrashModel = mongoose.models.ContentTrash
  ? mongoose.model<IContentTrash>("ContentTrash")
  : mongoose.model<IContentTrash>(
      "ContentTrash",
      ContentTrashSchema,
      "content_trash"
    )
