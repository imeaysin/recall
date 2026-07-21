import mongoose, { Schema, type Document, type Types } from "mongoose"

export const INGESTION_STEPS = [
  "EXTRACT",
  "METADATA",
  "GRAPH",
  "EMBED",
] as const
export type IngestionStep = (typeof INGESTION_STEPS)[number]

export interface IIngestionJob extends Document {
  _id: Types.ObjectId
  contentId: Types.ObjectId
  userId: string
  attemptNumber: number
  step: IngestionStep
  outcome: "SUCCESS" | "FAILED"
  durationMs?: number
  errorMessage?: string
  createdAt: Date
}

export const IngestionJobSchema = new Schema<IIngestionJob>({
  contentId: { type: Schema.Types.ObjectId, required: true },
  userId: { type: String, required: true },
  attemptNumber: { type: Number, required: true },
  step: { type: String, enum: INGESTION_STEPS, required: true },
  outcome: { type: String, enum: ["SUCCESS", "FAILED"], required: true },
  durationMs: { type: Number },
  errorMessage: { type: String },
  createdAt: { type: Date, required: true, default: Date.now },
})

IngestionJobSchema.index({ contentId: 1, createdAt: -1 })
IngestionJobSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 }
)

export const IngestionJobModel = mongoose.models.IngestionJob
  ? mongoose.model<IIngestionJob>("IngestionJob")
  : mongoose.model<IIngestionJob>(
      "IngestionJob",
      IngestionJobSchema,
      "ingestion_jobs"
    )
