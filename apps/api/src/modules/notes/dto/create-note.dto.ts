import { CreateNoteSchema } from "@workspace/contracts"
import { createZodDto } from "nestjs-zod"

export class CreateNoteDto extends createZodDto(CreateNoteSchema) {}
