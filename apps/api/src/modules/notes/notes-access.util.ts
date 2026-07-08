import { NoteErrorCode } from "@workspace/contracts"
import { apiForbidden, apiNotFound } from "@/common/exceptions/api.exception"
import type { NoteEntity } from "./entities/note.entity"

export const NOTE_FORBIDDEN_MESSAGE = "Not allowed to modify this note"

/** When a scoped mutation misses, distinguish 404 (missing/wrong org) from 403 (wrong user). */
export function assertNoteAccessOrThrow(
  existing: NoteEntity | null,
  organizationId: string
): never {
  if (!existing || existing.organizationId !== organizationId) {
    apiNotFound("Note not found", NoteErrorCode.NOT_FOUND)
  }
  apiForbidden(NOTE_FORBIDDEN_MESSAGE, NoteErrorCode.FORBIDDEN)
}
