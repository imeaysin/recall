import { SaveUrlContentSchema } from "@workspace/contracts"
import { createZodDto } from "nestjs-zod"

export class SaveUrlContentDto extends createZodDto(SaveUrlContentSchema) {}
