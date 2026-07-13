import { NoteForbiddenException } from "./domain/exceptions/note-forbidden.exception"
import { NoteNotFoundException } from "./domain/exceptions/note-not-found.exception"
import type { NoteEntity } from "./domain/note.model"

export const NOTE_FORBIDDEN_MESSAGE = "Not allowed to modify this note"

/** When a scoped mutation misses, distinguish 404 (missing/wrong org) from 403 (wrong user). */
export function assertNoteAccessOrThrow(
  existing: NoteEntity | null,
  organizationId: string
): void {
  if (!existing) {
    throw new NoteNotFoundException("Note not found")
  }

  if (existing.organizationId !== organizationId) {
    throw new NoteForbiddenException(NOTE_FORBIDDEN_MESSAGE)
  }
}
