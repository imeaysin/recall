import {
  BulkDeleteNotesApiResponseSchema,
  BulkDeleteNotesSchema,
  CreateNoteSchema,
  NoteApiResponseSchema,
  NotesListApiResponseSchema,
  UpdateNoteSchema,
} from "@workspace/contracts"
import { createZodDto } from "nestjs-zod"

export class CreateNoteDto extends createZodDto(CreateNoteSchema) {}

export class UpdateNoteDto extends createZodDto(UpdateNoteSchema) {}

export class BulkDeleteNotesDto extends createZodDto(BulkDeleteNotesSchema) {}

export class NoteApiResponseDto extends createZodDto(NoteApiResponseSchema) {}

export class NotesListApiResponseDto extends createZodDto(
  NotesListApiResponseSchema
) {}

export class BulkDeleteNotesApiResponseDto extends createZodDto(
  BulkDeleteNotesApiResponseSchema
) {}
