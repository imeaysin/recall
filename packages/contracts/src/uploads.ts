import { z } from "zod"

export const UploadResponseSchema = z.object({
  path: z.string(),
  url: z.string(),
  etag: z.string().optional(),
  contentLength: z.number().optional(),
})

export type UploadResponse = z.infer<typeof UploadResponseSchema>
