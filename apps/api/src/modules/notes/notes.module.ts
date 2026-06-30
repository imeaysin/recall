import { Module } from "@nestjs/common"
import { CqrsModule } from "@nestjs/cqrs"
import { CreateNoteHandler } from "./commands/create-note.handler"
import { BulkDeleteNotesHandler } from "./commands/bulk-delete-notes.handler"
import { DeleteNoteHandler } from "./commands/delete-note.handler"
import { UpdateNoteHandler } from "./commands/update-note.handler"
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
export class NotesModule {}
