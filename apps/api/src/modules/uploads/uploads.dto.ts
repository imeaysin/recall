import {
  UploadApiResponseSchema,
  UploadResponseSchema,
} from "@workspace/contracts"
import { createZodDto } from "nestjs-zod"

export class UploadResponseDto extends createZodDto(UploadResponseSchema) {}

export class UploadApiResponseDto extends createZodDto(
  UploadApiResponseSchema
) {}
