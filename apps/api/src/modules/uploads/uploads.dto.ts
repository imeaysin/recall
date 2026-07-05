import { UploadApiResponseSchema } from "@workspace/contracts"
import { createZodDto } from "nestjs-zod"

export class UploadApiResponseDto extends createZodDto(
  UploadApiResponseSchema
) {}

export type FileMetadata = {
  buffer: Buffer
  originalname: string
  mimetype: string
  size: number
}
