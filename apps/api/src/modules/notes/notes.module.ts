import { Module } from "@nestjs/common"
import { CqrsModule } from "@nestjs/cqrs"
import {
  BulkDeleteNotesHandler,
  CreateNoteHandler,
  DeleteNoteHandler,
  UpdateNoteHandler,
} from "./commands"
import { ListNotesHandler } from "./queries"
import { NotesController } from "./notes.controller"
import { NotesRepository } from "./repositories/notes.repository"
import { NotesCronProducer } from "./notes-cron.producer"
import { NotesQueueConsumer } from "./notes-queue.consumer"

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
    NotesCronProducer,
    NotesQueueConsumer,
  ],
})
export class NotesModule {}
