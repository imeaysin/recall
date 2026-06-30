import {
  HealthApiResponseSchema,
  HealthResponseSchema,
} from "@workspace/contracts"
import { createZodDto } from "nestjs-zod"

export class HealthResponseDto extends createZodDto(HealthResponseSchema) {}

export class HealthApiResponseDto extends createZodDto(
  HealthApiResponseSchema
) {}
