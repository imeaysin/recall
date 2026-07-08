import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectQueue } from "@nestjs/bullmq"
import { Queue } from "bullmq"
import type { NoteResponse } from "@workspace/contracts"
import { jobsEnv } from "@workspace/config/jobs"
import { toNoteResponse } from "../dto/note-response.mapper"
import { NotesRepository } from "../repositories/notes.repository"
import { CreateNoteCommand } from "./create-note.command"
import type { NoteJobPayload } from "../notes-cron.producer"

@CommandHandler(CreateNoteCommand)
export class CreateNoteHandler implements ICommandHandler<CreateNoteCommand> {
  constructor(
    private readonly notesRepository: NotesRepository,
    @InjectQueue(jobsEnv.JOBS_QUEUE_NAME)
    private readonly jobQueue: Queue<NoteJobPayload>
  ) {}

  async execute(command: CreateNoteCommand): Promise<NoteResponse> {
    const note = await this.notesRepository.insert(command.entity)

    await this.jobQueue.add(
      "note.created",
      {
        type: "note.created",
        noteId: note._id.toString(),
        authorId: command.scope.userId,
      },
      {
        removeOnComplete: true,
        removeOnFail: false,
      }
    )

    return toNoteResponse(note)
  }
}
