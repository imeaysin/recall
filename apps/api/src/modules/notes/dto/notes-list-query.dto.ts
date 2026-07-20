import { NotesListQuerySchema } from "@workspace/contracts"
import { createZodDto } from "nestjs-zod"

export class NotesListQueryDto extends createZodDto(NotesListQuerySchema) {}
