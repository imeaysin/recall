import { Module } from "@nestjs/common"
import { NotesController } from "./notes.controller"
import { NotesService } from "./notes.service"
import { NoteQueryRepository } from "./repository/note.query"
import { NoteCommandRepository } from "./repository/note.command"
import { NotesCronProducer } from "./notes-cron.producer"
import { NotesQueueConsumer } from "./notes-queue.consumer"

@Module({
  controllers: [NotesController],
  providers: [
    NoteQueryRepository,
    NoteCommandRepository,
    NotesService,
    NotesCronProducer,
    NotesQueueConsumer,
  ],
})
export class NotesModule {}
