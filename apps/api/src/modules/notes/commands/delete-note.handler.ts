import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { DomainErrorCode } from "@workspace/contracts"
import {
  apiForbidden,
  apiNotFound,
} from "../../../common/exceptions/api.exception"
import { NotesRepository } from "../repositories/notes.repository"
import { DeleteNoteCommand } from "./delete-note.command"

@CommandHandler(DeleteNoteCommand)
export class DeleteNoteHandler implements ICommandHandler<DeleteNoteCommand> {
  constructor(private readonly notesRepository: NotesRepository) {}

  async execute(command: DeleteNoteCommand): Promise<void> {
    const deleted = await this.notesRepository.deleteByIdForUser(
      command.noteId,
      command.userId
    )
    if (deleted) return

    const existing = await this.notesRepository.findById(command.noteId)
    if (!existing) {
      apiNotFound("Note not found", DomainErrorCode.NOTE_NOT_FOUND)
    }
    apiForbidden(
      "Not allowed to delete this note",
      DomainErrorCode.NOTE_FORBIDDEN
    )
  }
}
