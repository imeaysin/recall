import { Schema, model, models } from "mongoose"
import type { Document, Model } from "mongoose"

export interface IMember {
  organizationId: string
  userId: string
  role: string
  createdAt: Date
}

export interface IMemberDocument extends IMember, Document<string> {}

export const MemberSchema: Schema<IMemberDocument> =
  new Schema<IMemberDocument>(
    {
      _id: { type: String, required: true },
      organizationId: { type: String, required: true },
      userId: { type: String, required: true },
      role: { type: String, required: true },
    },
    {
      timestamps: { createdAt: true, updatedAt: false },
      collection: "member",
    }
  )

export const MemberModel: Model<IMemberDocument> =
  models.Member || model<IMemberDocument>("Member", MemberSchema)
