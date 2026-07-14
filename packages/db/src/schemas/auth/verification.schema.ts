import { Schema, model, models } from "mongoose"
import type { Document, Model } from "mongoose"

export interface IVerification {
  identifier: string
  value: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface IVerificationDocument
  extends IVerification, Document<string> {}

export const VerificationSchema: Schema<IVerificationDocument> =
  new Schema<IVerificationDocument>(
    {
      _id: { type: String, required: true },
      identifier: { type: String, required: true },
      value: { type: String, required: true },
      expiresAt: { type: Date, required: true },
    },
    {
      timestamps: true,
      collection: "verification",
    }
  )

export const VerificationModel: Model<IVerificationDocument> =
  models.Verification ||
  model<IVerificationDocument>("Verification", VerificationSchema)
