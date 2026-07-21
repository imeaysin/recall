import {
  ContentApiResponseSchema,
  ContentListApiResponseSchema,
} from "@workspace/contracts"
import { createZodDto } from "nestjs-zod"

export class ContentApiResponseDto extends createZodDto(
  ContentApiResponseSchema
) {}

export class ContentListApiResponseDto extends createZodDto(
  ContentListApiResponseSchema
) {}
