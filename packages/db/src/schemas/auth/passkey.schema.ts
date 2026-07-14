import { Schema, model, models } from "mongoose"
import type { Document, Model } from "mongoose"

export interface IPasskey {
  name?: string | null
  publicKey: string
  userId: string
  credentialID: string
  counter: number
  deviceType: string
  backedUp: boolean
  transports?: string | null
  createdAt: Date
}

export interface IPasskeyDocument extends IPasskey, Document<string> {}

export const PasskeySchema: Schema<IPasskeyDocument> =
  new Schema<IPasskeyDocument>(
    {
      _id: { type: String, required: true },
      name: { type: String, default: null },
      publicKey: { type: String, required: true },
      userId: { type: String, required: true },
      credentialID: { type: String, required: true },
      counter: { type: Number, required: true },
      deviceType: { type: String, required: true },
      backedUp: { type: Boolean, required: true },
      transports: { type: String, default: null },
    },
    {
      timestamps: { createdAt: true, updatedAt: false },
      collection: "passkey",
    }
  )

export const PasskeyModel: Model<IPasskeyDocument> =
  models.Passkey || model<IPasskeyDocument>("Passkey", PasskeySchema)
