import { Schema, model, models } from "mongoose"
import type { Document, Model } from "mongoose"

export interface IUser {
  name: string
  email: string
  emailVerified: boolean
  image?: string | null
  createdAt: Date
  updatedAt: Date

  // custom fields
  bio?: string | null

  // admin plugin
  role?: string | null
  banned?: boolean | null
  banReason?: string | null
  banExpires?: Date | null

  // two factor plugin
  twoFactorEnabled?: boolean | null
}

export interface IUserDocument extends IUser, Document<string> {}

export const UserSchema: Schema<IUserDocument> = new Schema<IUserDocument>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, required: true },
    image: { type: String, default: null },

    // custom fields
    bio: { type: String, default: null },

    // admin plugin
    role: { type: String, default: null },
    banned: { type: Boolean, default: null },
    banReason: { type: String, default: null },
    banExpires: { type: Date, default: null },

    // two factor plugin
    twoFactorEnabled: { type: Boolean, default: null },
  },
  {
    timestamps: true,
    collection: "user",
  }
)

export const UserModel: Model<IUserDocument> =
  models.User || model<IUserDocument>("User", UserSchema)
