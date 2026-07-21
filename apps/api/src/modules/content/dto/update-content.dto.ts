import { UpdateContentSchema } from "@workspace/contracts"
import { createZodDto } from "nestjs-zod"

export class UpdateContentDto extends createZodDto(UpdateContentSchema) {}
