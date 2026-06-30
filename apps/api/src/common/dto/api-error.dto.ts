import { ApiErrorResponseSchema } from "@workspace/contracts"
import { createZodDto } from "nestjs-zod"

export class ApiErrorResponseDto extends createZodDto(ApiErrorResponseSchema) {}
