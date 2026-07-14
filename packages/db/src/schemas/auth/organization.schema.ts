import { Schema, model, models } from "mongoose"
import type { Document, Model } from "mongoose"

export interface IOrganization {
  name: string
  slug: string
  logo?: string | null
  createdAt: Date
  metadata?: string | null
}

export interface IOrganizationDocument
  extends IOrganization, Document<string> {}

export const OrganizationSchema: Schema<IOrganizationDocument> =
  new Schema<IOrganizationDocument>(
    {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true },
      logo: { type: String, default: null },
      metadata: { type: String, default: null },
    },
    {
      timestamps: true,
      collection: "organization",
    }
  )

export const OrganizationModel: Model<IOrganizationDocument> =
  models.Organization ||
  model<IOrganizationDocument>("Organization", OrganizationSchema)
