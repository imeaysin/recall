import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { ForbiddenException, NotFoundException } from "@nestjs/common"
import type { NoteResponse } from "@workspace/contracts"
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
    if (!existing) throw new NotFoundException("Note not found")
    throw new ForbiddenException("Not allowed to update this note")
  }
}
