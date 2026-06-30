import { z } from "zod"
import { apiSuccessResponse } from "../api/envelopes"

export const UploadResponseSchema = z
  .object({
    path: z.string().meta({
      description: "Storage path of the uploaded file",
      examples: ["user-id/uuid-file.png"],
    }),
    url: z.string().meta({
      description: "Public URL to access the file",
      examples: ["http://localhost:3000/uploads/user-id/uuid-file.png"],
    }),
    etag: z.string().optional().describe("Storage etag, when available"),
    contentLength: z
      .number()
      .optional()
      .describe("File size in bytes, when available"),
  })
  .meta({
    id: "UploadResponseDto",
    title: "Upload response",
    description: "Metadata returned after a successful file upload.",
  })

export const UploadApiResponseSchema = apiSuccessResponse(
  UploadResponseSchema,
  {
    id: "UploadApiResponseDto",
    title: "Upload response",
    description: "Standard API envelope containing upload metadata.",
  }
)

export type UploadResponse = z.infer<typeof UploadResponseSchema>
