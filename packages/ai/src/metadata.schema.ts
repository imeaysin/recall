import { z } from "zod"

export const contentMetadataSchema = z.object({
  title: z.string().min(1).max(300),
  summary: z.string().min(1).max(4000),
  topics: z.array(z.string().min(1).max(80)).max(5),
})

export type ParsedContentMetadata = z.infer<typeof contentMetadataSchema>
