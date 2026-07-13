import {
  BulkDeleteNotesApiResponseSchema,
  NoteApiResponseSchema,
  NotesListApiResponseSchema,
} from "@workspace/contracts"
import { createZodDto } from "nestjs-zod"

export class NoteApiResponseDto extends createZodDto(NoteApiResponseSchema) {}

export class NotesListApiResponseDto extends createZodDto(
  NotesListApiResponseSchema
) {}

export class BulkDeleteNotesApiResponseDto extends createZodDto(
  BulkDeleteNotesApiResponseSchema
) {}
