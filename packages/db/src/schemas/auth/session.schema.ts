import { Schema, model, models } from "mongoose"
import type { Document, Model } from "mongoose"

export interface ISession {
  userId: string
  token: string
  expiresAt: Date
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: Date
  updatedAt: Date

  // organization plugin
  activeOrganizationId?: string | null
}

export interface ISessionDocument extends ISession, Document<string> {}

export const SessionSchema: Schema<ISessionDocument> =
  new Schema<ISessionDocument>(
    {
      _id: { type: String, required: true },
      userId: { type: String, required: true },
      token: { type: String, required: true, unique: true },
      expiresAt: { type: Date, required: true },
      ipAddress: { type: String, default: null },
      userAgent: { type: String, default: null },

      // organization plugin
      activeOrganizationId: { type: String, default: null },
    },
    {
      timestamps: true,
      collection: "session",
    }
  )

export const SessionModel: Model<ISessionDocument> =
  models.Session || model<ISessionDocument>("Session", SessionSchema)
