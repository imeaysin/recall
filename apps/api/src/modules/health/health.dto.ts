import { HealthApiResponseSchema } from "@workspace/contracts"
import { createZodDto } from "nestjs-zod"

export class HealthApiResponseDto extends createZodDto(
  HealthApiResponseSchema
) {}
