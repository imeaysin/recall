import { Module } from "@nestjs/common"
import { NotesController } from "./notes.controller"
import { NotesService } from "./notes.service"
import { NotesCronProducer } from "./notes-cron.producer"
import { NotesQueueConsumer } from "./notes-queue.consumer"
import { NoteQueryRepository, NoteCommandRepository } from "./repository"

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
