import { z } from "zod"
import { apiSuccessResponse } from "../api/envelopes"

export const TopicResponseSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    name: z.string(),
    normalizedName: z.string(),
    contentCount: z.number().int().nonnegative(),
    isUserCreated: z.boolean(),
    isRoot: z.boolean(),
    color: z.string().optional(),
    mergedIntoTopicId: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .meta({
    id: "TopicResponseDto",
    title: "Topic",
    description: "A knowledge-graph topic node for the current user.",
  })

export const TopicListQuerySchema = z
  .object({
    includeRoot: z.coerce.boolean().optional(),
    includeMerged: z.coerce.boolean().optional(),
  })
  .strict()
  .meta({ id: "TopicListQueryDto" })

export const CreateTopicSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
  })
  .strict()
  .meta({ id: "CreateTopicDto" })

export const UpdateTopicSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
  })
  .strict()
  .meta({ id: "UpdateTopicDto" })

export const MergeTopicSchema = z
  .object({
    intoTopicId: z.string().min(1),
  })
  .strict()
  .meta({ id: "MergeTopicDto" })

export const DeleteTopicSchema = z
  .object({
    confirm: z.literal(true),
  })
  .strict()
  .meta({ id: "DeleteTopicDto" })

export const TopicListResponseSchema = z
  .object({
    items: z.array(TopicResponseSchema),
  })
  .meta({ id: "TopicListResponseDto" })

export const TopicApiResponseSchema = apiSuccessResponse(TopicResponseSchema, {
  id: "TopicApiResponseDto",
  title: "Topic response",
})

export const TopicListApiResponseSchema = apiSuccessResponse(
  TopicListResponseSchema,
  {
    id: "TopicListApiResponseDto",
    title: "Topic list response",
  }
)

export type TopicResponse = z.infer<typeof TopicResponseSchema>
export type TopicListQuery = z.infer<typeof TopicListQuerySchema>
export type CreateTopic = z.infer<typeof CreateTopicSchema>
export type UpdateTopic = z.infer<typeof UpdateTopicSchema>
export type MergeTopic = z.infer<typeof MergeTopicSchema>
export type DeleteTopic = z.infer<typeof DeleteTopicSchema>
export type TopicListResponse = z.infer<typeof TopicListResponseSchema>
