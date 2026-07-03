import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { NotesRepository } from "../repositories/notes.repository"
import { DeleteNoteCommand } from "./delete-note.command"

@CommandHandler(DeleteNoteCommand)
export class DeleteNoteHandler implements ICommandHandler<DeleteNoteCommand> {
  constructor(private readonly notesRepository: NotesRepository) {}

  async execute(command: DeleteNoteCommand): Promise<void> {
    const deleted = await this.notesRepository.delete(command.scope)
    if (deleted) return

    return this.notesRepository.rejectMutationMiss(command.scope)
  }
}
