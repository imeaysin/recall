import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import type { NoteResponse } from "@workspace/contracts"
import { toNoteResponse } from "../dto/note-response.mapper"
import { NotesRepository } from "../repositories/notes.repository"
import { UpdateNoteCommand } from "./update-note.command"

@CommandHandler(UpdateNoteCommand)
export class UpdateNoteHandler implements ICommandHandler<UpdateNoteCommand> {
  constructor(private readonly notesRepository: NotesRepository) {}

  async execute(command: UpdateNoteCommand): Promise<NoteResponse> {
    const updated = await this.notesRepository.update(
      command.scope,
      command.input
    )
    if (updated) return toNoteResponse(updated)

    return this.notesRepository.rejectMutationMiss(command.scope)
  }
}
