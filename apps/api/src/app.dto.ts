import { ApiRootApiResponseSchema } from "@workspace/contracts"
import { createZodDto } from "nestjs-zod"

export class ApiRootApiResponseDto extends createZodDto(
  ApiRootApiResponseSchema
) {}
