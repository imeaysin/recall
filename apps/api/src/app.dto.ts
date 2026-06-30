import {
  ApiRootApiResponseSchema,
  ApiRootResponseSchema,
} from "@workspace/contracts"
import { createZodDto } from "nestjs-zod"

export class ApiRootResponseDto extends createZodDto(ApiRootResponseSchema) {}

export class ApiRootApiResponseDto extends createZodDto(
  ApiRootApiResponseSchema
) {}
