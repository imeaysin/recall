import {
  CreateTopicSchema,
  DeleteTopicSchema,
  MergeTopicSchema,
  TopicApiResponseSchema,
  TopicListApiResponseSchema,
  TopicListQuerySchema,
  UpdateTopicSchema,
} from "@workspace/contracts"
import { createZodDto } from "nestjs-zod"

export class TopicListQueryDto extends createZodDto(TopicListQuerySchema) {}

export class CreateTopicDto extends createZodDto(CreateTopicSchema) {}

export class UpdateTopicDto extends createZodDto(UpdateTopicSchema) {}

export class MergeTopicDto extends createZodDto(MergeTopicSchema) {}

export class DeleteTopicDto extends createZodDto(DeleteTopicSchema) {}

export class TopicApiResponseDto extends createZodDto(TopicApiResponseSchema) {}

export class TopicListApiResponseDto extends createZodDto(
  TopicListApiResponseSchema
) {}

export { toTopicResponse } from "./topic-response.mapper"
