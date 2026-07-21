import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface ITopic extends Document {
  _id: Types.ObjectId
  userId: string
  name: string
  normalizedName: string
  contentRefs: Types.ObjectId[]
  contentCount: number
  isUserCreated: boolean
  mergedIntoTopicId?: Types.ObjectId
  color?: string
  createdAt: Date
  updatedAt: Date
}

export const TopicSchema = new Schema<ITopic>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    normalizedName: { type: String, required: true },
    contentRefs: { type: [Schema.Types.ObjectId], required: true, default: [] },
    contentCount: { type: Number, required: true, default: 0 },
    isUserCreated: { type: Boolean, required: true, default: false },
    mergedIntoTopicId: { type: Schema.Types.ObjectId },
    color: { type: String },
  },
  { timestamps: true }
)

TopicSchema.index({ userId: 1, normalizedName: 1 }, { unique: true })
TopicSchema.index({ userId: 1, contentCount: -1 })

export const TopicModel = mongoose.models.Topic
  ? mongoose.model<ITopic>("Topic")
  : mongoose.model<ITopic>("Topic", TopicSchema, "topics")
