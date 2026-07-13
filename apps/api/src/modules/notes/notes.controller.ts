import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger"
import type { JwtClaims } from "@workspace/auth/types"
import {
  CurrentOrganization,
  CurrentUser,
  RequireOrgPermission,
} from "@/common/decorators"
import { ApiAuthErrorResponses } from "@/common/decorators/api-error-responses.decorator"
import { NotesService } from "./notes.service"
import { CreateNoteDto } from "./dto/create-note.dto"
import { UpdateNoteDto } from "./dto/update-note.dto"
import { BulkDeleteNotesDto } from "./dto/bulk-delete-notes.dto"
import {
  BulkDeleteNotesApiResponseDto,
  NoteApiResponseDto,
  NotesListApiResponseDto,
} from "./dto/note-responses.dto"

@ApiTags("notes")
@ApiAuthErrorResponses()
@Controller({ path: "notes", version: "1" })
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @RequireOrgPermission("content", "read")
  @ApiBearerAuth("bearer")
  @ApiOperation({
    summary: "List notes",
    description:
      "Returns all notes owned by the authenticated user in the active workspace.",
  })
  @ApiOkResponse({ type: NotesListApiResponseDto })
  async list(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: JwtClaims
  ) {
    return this.notesService.listNotes({ organizationId, userId: user.id })
  }

  @Post()
  @RequireOrgPermission("content", "create")
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth("bearer")
  @ApiOperation({
    summary: "Create a note",
    description:
      "Creates a new note for the authenticated user in the active workspace.",
  })
  @ApiCreatedResponse({ type: NoteApiResponseDto })
  create(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: JwtClaims,
    @Body() body: CreateNoteDto
  ) {
    return this.notesService.createNote(
      { organizationId, userId: user.id },
      body
    )
  }

  @Post("bulk-delete")
  @RequireOrgPermission("content", "delete")
  @ApiBearerAuth("bearer")
  @ApiOperation({
    summary: "Bulk delete notes",
    description:
      "Deletes up to 100 notes by id. Only notes owned by the user in the active workspace are removed.",
  })
  @ApiOkResponse({ type: BulkDeleteNotesApiResponseDto })
  bulkDelete(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: JwtClaims,
    @Body() body: BulkDeleteNotesDto
  ) {
    return this.notesService.bulkDeleteNotes({
      organizationId,
      userId: user.id,
      ids: body.ids,
    })
  }

  @Patch(":id")
  @RequireOrgPermission("content", "update")
  @ApiBearerAuth("bearer")
  @ApiOperation({
    summary: "Update a note",
    description:
      "Updates title and/or body of a note owned by the user in the active workspace.",
  })
  @ApiParam({
    name: "id",
    description: "Note id",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiOkResponse({ type: NoteApiResponseDto })
  update(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: JwtClaims,
    @Param("id") id: string,
    @Body() body: UpdateNoteDto
  ) {
    return this.notesService.updateNote(
      { organizationId, userId: user.id, noteId: id },
      body
    )
  }

  @Delete(":id")
  @RequireOrgPermission("content", "delete")
  @HttpCode(204)
  @ApiBearerAuth("bearer")
  @ApiOperation({
    summary: "Delete a note",
    description:
      "Permanently deletes a note owned by the user in the active workspace.",
  })
  @ApiParam({
    name: "id",
    description: "Note id",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiNoContentResponse({ description: "Note deleted" })
  remove(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: JwtClaims,
    @Param("id") id: string
  ) {
    return this.notesService.deleteNote({
      organizationId,
      userId: user.id,
      noteId: id,
    })
  }
}
