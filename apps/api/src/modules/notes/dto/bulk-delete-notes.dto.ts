import { BulkDeleteNotesSchema } from "@workspace/contracts"
import { createZodDto } from "nestjs-zod"

export class BulkDeleteNotesDto extends createZodDto(BulkDeleteNotesSchema) {}
