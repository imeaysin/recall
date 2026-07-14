import { Schema, model, models } from "mongoose"
import type { Document, Model } from "mongoose"

export interface IAccount {
  userId: string
  accountId: string
  providerId: string
  accessToken?: string | null
  refreshToken?: string | null
  accessTokenExpiresAt?: Date | null
  refreshTokenExpiresAt?: Date | null
  scope?: string | null
  idToken?: string | null
  password?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface IAccountDocument extends IAccount, Document<string> {}

export const AccountSchema: Schema<IAccountDocument> =
  new Schema<IAccountDocument>(
    {
      _id: { type: String, required: true },
      userId: { type: String, required: true },
      accountId: { type: String, required: true },
      providerId: { type: String, required: true },
      accessToken: { type: String, default: null },
      refreshToken: { type: String, default: null },
      accessTokenExpiresAt: { type: Date, default: null },
      refreshTokenExpiresAt: { type: Date, default: null },
      scope: { type: String, default: null },
      idToken: { type: String, default: null },
      password: { type: String, default: null },
    },
    {
      timestamps: true,
      collection: "account",
    }
  )

export const AccountModel: Model<IAccountDocument> =
  models.Account || model<IAccountDocument>("Account", AccountSchema)
