import { UploadApiResponseSchema } from "@workspace/contracts"
import { createZodDto } from "nestjs-zod"

export class UploadApiResponseDto extends createZodDto(
  UploadApiResponseSchema
) {}
