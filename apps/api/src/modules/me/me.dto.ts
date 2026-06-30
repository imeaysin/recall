import { MeApiResponseSchema, MeResponseSchema } from "@workspace/contracts"
import { createZodDto } from "nestjs-zod"

export class MeResponseDto extends createZodDto(MeResponseSchema) {}

export class MeApiResponseDto extends createZodDto(MeApiResponseSchema) {}
