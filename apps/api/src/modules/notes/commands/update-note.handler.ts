import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import type { NoteResponse } from "@workspace/contracts"
import { DomainErrorCode } from "@workspace/contracts"
import {
  apiForbidden,
  apiNotFound,
} from "../../../common/exceptions/api.exception"
import { toNoteResponse } from "../dto/note-response.mapper"
import { NotesRepository } from "../repositories/notes.repository"
import { UpdateNoteCommand } from "./update-note.command"

@CommandHandler(UpdateNoteCommand)
export class UpdateNoteHandler implements ICommandHandler<UpdateNoteCommand> {
  constructor(private readonly notesRepository: NotesRepository) {}

  async execute(command: UpdateNoteCommand): Promise<NoteResponse> {
    const updated = await this.notesRepository.updateByIdForUser(
      command.noteId,
      command.userId,
      command.input
    )
    if (updated) return toNoteResponse(updated)

    const existing = await this.notesRepository.findById(command.noteId)
    if (!existing) {
      apiNotFound("Note not found", DomainErrorCode.NOTE_NOT_FOUND)
    }
    apiForbidden(
      "Not allowed to update this note",
      DomainErrorCode.NOTE_FORBIDDEN
    )
  }
}
