import mongoose, { Schema, type Document, type Types } from "mongoose"

export const AI_USAGE_PROVIDERS = ["GEMINI_FLASH", "GEMINI_EMBEDDING"] as const
export type AiUsageProvider = (typeof AI_USAGE_PROVIDERS)[number]

export interface IApiUsage extends Document {
  _id: Types.ObjectId
  date: string
  provider: AiUsageProvider
  requestCount: number
  tokenCount: number
  quotaExceededCount: number
}

export const ApiUsageSchema = new Schema<IApiUsage>({
  date: { type: String, required: true },
  provider: { type: String, enum: AI_USAGE_PROVIDERS, required: true },
  requestCount: { type: Number, required: true, default: 0 },
  tokenCount: { type: Number, required: true, default: 0 },
  quotaExceededCount: { type: Number, required: true, default: 0 },
})

ApiUsageSchema.index({ date: 1, provider: 1 }, { unique: true })

export const ApiUsageModel = mongoose.models.ApiUsage
  ? mongoose.model<IApiUsage>("ApiUsage")
  : mongoose.model<IApiUsage>("ApiUsage", ApiUsageSchema, "api_usage")
