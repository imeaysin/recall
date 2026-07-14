import { Schema, model, models } from "mongoose"
import type { Document, Model } from "mongoose"

export interface IInvitation {
  organizationId: string
  email: string
  role: string
  status: string
  expiresAt: Date
  inviterId: string
}

export interface IInvitationDocument extends IInvitation, Document<string> {}

export const InvitationSchema: Schema<IInvitationDocument> =
  new Schema<IInvitationDocument>(
    {
      _id: { type: String, required: true },
      organizationId: { type: String, required: true },
      email: { type: String, required: true },
      role: { type: String, required: true },
      status: { type: String, required: true },
      expiresAt: { type: Date, required: true },
      inviterId: { type: String, required: true },
    },
    {
      collection: "invitation",
    }
  )

export const InvitationModel: Model<IInvitationDocument> =
  models.Invitation ||
  model<IInvitationDocument>("Invitation", InvitationSchema)
