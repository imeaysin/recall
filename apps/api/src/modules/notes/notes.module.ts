import { Module, Inject, type OnModuleInit } from "@nestjs/common"
import { CqrsModule } from "@nestjs/cqrs"
import type { JobQueue } from "@workspace/jobs"
import { JOB_QUEUE } from "@/common/jobs/jobs.module"
import { CreateNoteHandler } from "./commands/create-note.handler"
import { BulkDeleteNotesHandler } from "./commands/bulk-delete-notes.handler"
import { DeleteNoteHandler } from "./commands/delete-note.handler"
import { UpdateNoteHandler } from "./commands/update-note.handler"
import { registerNotesJobHandlers } from "./notes-job-handlers"
import { NotesController } from "./notes.controller"
import { ListNotesHandler } from "./queries/list-notes.handler"
import { NotesRepository } from "./repositories/notes.repository"

@Module({
  imports: [CqrsModule],
  controllers: [NotesController],
  providers: [
    NotesRepository,
    ListNotesHandler,
    CreateNoteHandler,
    UpdateNoteHandler,
    DeleteNoteHandler,
    BulkDeleteNotesHandler,
  ],
})
export class NotesModule implements OnModuleInit {
  constructor(@Inject(JOB_QUEUE) private readonly jobQueue: JobQueue) {}

  onModuleInit() {
    registerNotesJobHandlers(this.jobQueue)
  }
}
