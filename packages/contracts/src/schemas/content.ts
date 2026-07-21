import { z } from "zod"
import { apiSuccessResponse } from "../api/envelopes"

export const ContentSourceTypeSchema = z.enum([
  "ARTICLE",
  "YOUTUBE",
  "PDF",
  "IMAGE",
])

export const ContentStatusSchema = z.enum([
  "PENDING",
  "EXTRACTING",
  "METADATA",
  "GRAPH",
  "EMBEDDING",
  "DEFERRED",
  "COMPLETED",
  "FAILED",
])

export const LibraryStatusSchema = z.enum(["QUEUE", "ARCHIVE"])

export const ContentErrorCodeSchema = z.enum([
  "EXTRACTION_FAILED",
  "AI_QUOTA_EXCEEDED",
  "AI_ERROR",
  "UNSUPPORTED_FORMAT",
  "FILE_TOO_LARGE",
  "TIMEOUT",
])

export const TopicSnapshotSchema = z
  .object({
    topicId: z.string(),
    name: z.string(),
  })
  .meta({ id: "TopicSnapshotDto" })

export const ContentResponseSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    sourceType: ContentSourceTypeSchema,
    sourceUrl: z.string().optional(),
    normalizedUrl: z.string().optional(),
    title: z.string().optional(),
    summary: z.string().optional(),
    titleEditedByUser: z.boolean(),
    summaryEditedByUser: z.boolean(),
    wordCount: z.number().optional(),
    language: z.string().optional(),
    topicSnapshot: z.array(TopicSnapshotSchema),
    isOrphan: z.boolean(),
    status: ContentStatusSchema,
    processingStep: z
      .enum(["EXTRACT", "METADATA", "GRAPH", "EMBED"])
      .optional(),
    retryCount: z.number(),
    errorMessage: z.string().optional(),
    errorCode: ContentErrorCodeSchema.optional(),
    libraryStatus: LibraryStatusSchema,
    possibleDuplicateOfContentId: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .meta({
    id: "ContentResponseDto",
    title: "Content",
    description: "A saved library item with ingestion status.",
  })

export const ContentListQuerySchema = z
  .object({
    libraryStatus: LibraryStatusSchema.optional(),
    status: ContentStatusSchema.optional(),
    search: z.string().trim().max(200).optional(),
  })
  .strict()
  .meta({ id: "ContentListQueryDto" })

export const SaveUrlContentSchema = z
  .object({
    url: z
      .string()
      .url()
      .meta({
        description: "Article or YouTube URL to ingest",
        examples: ["https://example.com/article"],
      }),
  })
  .strict()
  .meta({
    id: "SaveUrlContentDto",
    title: "Save URL",
    description: "Persist a PENDING content record for async ingestion.",
  })

export const UpdateContentSchema = z
  .object({
    title: z.string().trim().min(1).max(300).optional(),
    summary: z.string().trim().min(1).max(4000).optional(),
    libraryStatus: LibraryStatusSchema.optional(),
    topicIds: z.array(z.string()).max(10).optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.title !== undefined ||
      value.summary !== undefined ||
      value.libraryStatus !== undefined ||
      value.topicIds !== undefined,
    { message: "At least one updatable field is required" }
  )
  .meta({ id: "UpdateContentDto" })

export const ContentListResponseSchema = z
  .object({
    items: z.array(ContentResponseSchema),
  })
  .meta({ id: "ContentListResponseDto" })

export const ContentApiResponseSchema = apiSuccessResponse(
  ContentResponseSchema,
  {
    id: "ContentApiResponseDto",
    title: "Content response",
  }
)

export const ContentListApiResponseSchema = apiSuccessResponse(
  ContentListResponseSchema,
  {
    id: "ContentListApiResponseDto",
    title: "Content list response",
  }
)

export const ContentTrashItemSchema = z
  .object({
    id: z.string(),
    originalContentId: z.string(),
    title: z.string().optional(),
    sourceType: ContentSourceTypeSchema.optional(),
    deletedAt: z.string(),
    purgeAt: z.string(),
  })
  .meta({
    id: "ContentTrashItemDto",
    title: "Content trash item",
  })

export const ContentTrashListResponseSchema = z
  .object({
    items: z.array(ContentTrashItemSchema),
  })
  .meta({ id: "ContentTrashListResponseDto" })

export const ContentTrashListApiResponseSchema = apiSuccessResponse(
  ContentTrashListResponseSchema,
  {
    id: "ContentTrashListApiResponseDto",
    title: "Content trash list response",
  }
)

export const RegenerateContentSchema = z
  .object({
    force: z.literal(true).optional(),
  })
  .strict()
  .meta({
    id: "RegenerateContentDto",
    title: "Regenerate AI metadata",
    description:
      "Re-queue ingestion and allow AI to overwrite previously user-edited title/summary.",
  })

/** Soft cap for PDF library uploads (FR-2.3). Separate from generic /uploads. */
export const CONTENT_UPLOAD_MAX_BYTES = 15_000_000

export type ContentResponse = z.infer<typeof ContentResponseSchema>
export type ContentListQuery = z.infer<typeof ContentListQuerySchema>
export type SaveUrlContent = z.infer<typeof SaveUrlContentSchema>
export type UpdateContent = z.infer<typeof UpdateContentSchema>
export type ContentListResponse = z.infer<typeof ContentListResponseSchema>
export type ContentTrashItem = z.infer<typeof ContentTrashItemSchema>
export type ContentTrashListResponse = z.infer<
  typeof ContentTrashListResponseSchema
>
export type RegenerateContent = z.infer<typeof RegenerateContentSchema>
