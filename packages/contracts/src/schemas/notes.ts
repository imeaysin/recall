import { z } from "zod"
import { apiSuccessResponse } from "../api/envelopes"

export const NoteResponseSchema = z
  .object({
    id: z.string().describe("Unique note identifier"),
    userId: z.string().describe("Owner user id"),
    title: z.string().describe("Note title"),
    body: z.string().describe("Note body"),
    createdAt: z.string().describe("ISO-8601 creation timestamp"),
    updatedAt: z.string().describe("ISO-8601 last update timestamp"),
  })
  .meta({
    id: "NoteResponseDto",
    title: "Note",
    description: "A user-owned note.",
  })

export const CreateNoteSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .meta({
        description: "Short title for the note",
        examples: ["Ship the dashboard"],
      }),
    body: z
      .string()
      .max(5000)
      .optional()
      .default("")
      .meta({
        description: "Optional longer content",
        examples: ["Follow up with design review."],
      }),
  })
  .strict()
  .meta({
    id: "CreateNoteDto",
    title: "Create note",
    description: "Payload to create a new note.",
  })

export const UpdateNoteSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .optional()
      .meta({
        description: "Updated title",
        examples: ["Ship the dashboard v2"],
      }),
    body: z
      .string()
      .max(5000)
      .optional()
      .meta({
        description: "Updated body",
        examples: ["Design review scheduled for Friday."],
      }),
  })
  .refine((data) => data.title !== undefined || data.body !== undefined, {
    message: "At least one field is required",
  })
  .strict()
  .meta({
    id: "UpdateNoteDto",
    title: "Update note",
    description: "Partial update — send at least one of title or body.",
  })

export const BulkDeleteNotesSchema = z
  .object({
    ids: z
      .array(z.string().min(1))
      .min(1)
      .max(100)
      .meta({
        description: "Note ids to delete (max 100)",
        examples: [["507f1f77bcf86cd799439011", "507f191e810c19729de860ea"]],
      }),
  })
  .strict()
  .meta({
    id: "BulkDeleteNotesDto",
    title: "Bulk delete notes",
    description: "Delete multiple notes owned by the current user.",
  })

export const BulkDeleteNotesResponseSchema = z
  .object({
    deletedCount: z
      .number()
      .int()
      .nonnegative()
      .describe("Number of notes actually deleted"),
  })
  .meta({
    id: "BulkDeleteNotesResponseDto",
    title: "Bulk delete result",
    description: "Result of a bulk delete operation.",
  })

export const NotesListResponseSchema = z
  .object({
    items: z.array(NoteResponseSchema).describe("Notes for the current user"),
  })
  .meta({
    id: "NotesListResponseDto",
    title: "Notes list",
    description: "Paginated-style list wrapper (all notes for the user).",
  })

export type NoteResponse = z.infer<typeof NoteResponseSchema>
export type CreateNoteInput = z.infer<typeof CreateNoteSchema>
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>
export type BulkDeleteNotesInput = z.infer<typeof BulkDeleteNotesSchema>
export type BulkDeleteNotesResponse = z.infer<
  typeof BulkDeleteNotesResponseSchema
>
export type NotesListResponse = z.infer<typeof NotesListResponseSchema>

export const NoteApiResponseSchema = apiSuccessResponse(NoteResponseSchema, {
  id: "NoteApiResponseDto",
  title: "Note response",
  description: "Standard API envelope containing a single note.",
})

export const NotesListApiResponseSchema = apiSuccessResponse(
  NotesListResponseSchema,
  {
    id: "NotesListApiResponseDto",
    title: "Notes list response",
    description: "Standard API envelope containing the notes list.",
  }
)

export const BulkDeleteNotesApiResponseSchema = apiSuccessResponse(
  BulkDeleteNotesResponseSchema,
  {
    id: "BulkDeleteNotesApiResponseDto",
    title: "Bulk delete response",
    description: "Standard API envelope containing bulk delete results.",
  }
)
