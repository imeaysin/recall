import { Schema, model, models } from "mongoose"
import type { Document, Model } from "mongoose"

export interface ITwoFactor {
  secret: string
  backupCodes: string
  userId: string
}

export interface ITwoFactorDocument extends ITwoFactor, Document<string> {}

export const TwoFactorSchema: Schema<ITwoFactorDocument> =
  new Schema<ITwoFactorDocument>(
    {
      _id: { type: String, required: true },
      secret: { type: String, required: true },
      backupCodes: { type: String, required: true },
      userId: { type: String, required: true },
    },
    {
      collection: "twoFactor",
    }
  )

export const TwoFactorModel: Model<ITwoFactorDocument> =
  models.TwoFactor || model<ITwoFactorDocument>("TwoFactor", TwoFactorSchema)
