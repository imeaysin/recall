import mongoose, { Schema, type Document, type Types } from "mongoose"

export const CONTENT_SOURCE_TYPES = [
  "ARTICLE",
  "YOUTUBE",
  "PDF",
  "IMAGE",
] as const
export type ContentSourceType = (typeof CONTENT_SOURCE_TYPES)[number]

export const CONTENT_STATUSES = [
  "PENDING",
  "EXTRACTING",
  "METADATA",
  "GRAPH",
  "EMBEDDING",
  "DEFERRED",
  "COMPLETED",
  "FAILED",
] as const
export type ContentStatus = (typeof CONTENT_STATUSES)[number]

export const CONTENT_PROCESSING_STEPS = [
  "EXTRACT",
  "METADATA",
  "GRAPH",
  "EMBED",
] as const
export type ContentProcessingStep = (typeof CONTENT_PROCESSING_STEPS)[number]

export const CONTENT_ERROR_CODES = [
  "EXTRACTION_FAILED",
  "AI_QUOTA_EXCEEDED",
  "AI_ERROR",
  "UNSUPPORTED_FORMAT",
  "FILE_TOO_LARGE",
  "TIMEOUT",
] as const
export type ContentErrorCode = (typeof CONTENT_ERROR_CODES)[number]

export const LIBRARY_STATUSES = ["QUEUE", "ARCHIVE"] as const
export type LibraryStatus = (typeof LIBRARY_STATUSES)[number]

export type TopicSnapshot = {
  topicId: Types.ObjectId
  name: string
}

export type SourceFileMeta = {
  originalName: string
  mimeType: string
  sizeBytes: number
}

export interface IContent extends Document {
  _id: Types.ObjectId
  userId: string
  sourceType: ContentSourceType
  sourceUrl?: string
  normalizedUrl?: string
  contentHash?: string
  possibleDuplicateOfContentId?: Types.ObjectId
  sourceFileMeta?: SourceFileMeta
  title?: string
  titleEditedByUser: boolean
  summary?: string
  summaryEditedByUser: boolean
  wordCount?: number
  language?: string
  topicRefs: Types.ObjectId[]
  topicSnapshot: TopicSnapshot[]
  isOrphan: boolean
  status: ContentStatus
  processingStep?: ContentProcessingStep
  retryCount: number
  lockedAt?: Date
  lockedBy?: string
  errorMessage?: string
  errorCode?: ContentErrorCode
  libraryStatus: LibraryStatus
  isDeleted: boolean
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const TopicSnapshotSchema = new Schema<TopicSnapshot>(
  {
    topicId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
  },
  { _id: false }
)

const SourceFileMetaSchema = new Schema<SourceFileMeta>(
  {
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
  },
  { _id: false }
)

export const ContentSchema = new Schema<IContent>(
  {
    userId: { type: String, required: true, index: true },
    sourceType: { type: String, enum: CONTENT_SOURCE_TYPES, required: true },
    sourceUrl: { type: String },
    normalizedUrl: { type: String },
    contentHash: { type: String },
    possibleDuplicateOfContentId: { type: Schema.Types.ObjectId },
    sourceFileMeta: { type: SourceFileMetaSchema },
    title: { type: String },
    titleEditedByUser: { type: Boolean, required: true, default: false },
    summary: { type: String },
    summaryEditedByUser: { type: Boolean, required: true, default: false },
    wordCount: { type: Number },
    language: { type: String },
    topicRefs: { type: [Schema.Types.ObjectId], required: true, default: [] },
    topicSnapshot: {
      type: [TopicSnapshotSchema],
      required: true,
      default: [],
    },
    isOrphan: { type: Boolean, required: true, default: true },
    status: {
      type: String,
      enum: CONTENT_STATUSES,
      required: true,
      default: "PENDING",
    },
    processingStep: { type: String, enum: CONTENT_PROCESSING_STEPS },
    retryCount: { type: Number, required: true, default: 0 },
    lockedAt: { type: Date },
    lockedBy: { type: String },
    errorMessage: { type: String },
    errorCode: { type: String, enum: CONTENT_ERROR_CODES },
    libraryStatus: {
      type: String,
      enum: LIBRARY_STATUSES,
      required: true,
      default: "QUEUE",
    },
    isDeleted: { type: Boolean, required: true, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
)

ContentSchema.index({
  userId: 1,
  libraryStatus: 1,
  isDeleted: 1,
  createdAt: -1,
})
ContentSchema.index(
  { userId: 1, normalizedUrl: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
      normalizedUrl: { $type: "string" },
    },
  }
)
ContentSchema.index({ status: 1, updatedAt: 1 })
ContentSchema.index({ userId: 1, contentHash: 1 }, { sparse: true })

export const ContentModel = mongoose.models.Content
  ? mongoose.model<IContent>("Content")
  : mongoose.model<IContent>("Content", ContentSchema, "content")
