import { Schema, model, models } from "mongoose"
import type { Document, Model } from "mongoose"

export interface IJwks {
  publicKey: string
  privateKey: string
  createdAt: Date
}

export interface IJwksDocument extends IJwks, Document<string> {}

export const JwksSchema: Schema<IJwksDocument> = new Schema<IJwksDocument>(
  {
    _id: { type: String, required: true },
    publicKey: { type: String, required: true },
    privateKey: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "jwks",
  }
)

export const JwksModel: Model<IJwksDocument> =
  models.Jwks || model<IJwksDocument>("Jwks", JwksSchema)
