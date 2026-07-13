import { UpdateNoteSchema } from "@workspace/contracts"
import { createZodDto } from "nestjs-zod"

export class UpdateNoteDto extends createZodDto(UpdateNoteSchema) {}
