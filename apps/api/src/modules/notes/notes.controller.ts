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
import { CommandBus, QueryBus } from "@nestjs/cqrs"
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
import {
  BulkDeleteNotesCommand,
  CreateNoteCommand,
  DeleteNoteCommand,
  UpdateNoteCommand,
} from "./commands"
import {
  BulkDeleteNotesApiResponseDto,
  BulkDeleteNotesDto,
  CreateNoteDto,
  NoteApiResponseDto,
  NotesListApiResponseDto,
  UpdateNoteDto,
} from "./notes.dto"
import { ListNotesQuery } from "./queries"

@ApiTags("notes")
@ApiAuthErrorResponses()
@Controller({ path: "notes", version: "1" })
export class NotesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

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
    return this.queryBus.execute(new ListNotesQuery(organizationId, user.id))
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
    return this.commandBus.execute(
      new CreateNoteCommand(organizationId, user.id, body)
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
    return this.commandBus.execute(
      new BulkDeleteNotesCommand(organizationId, user.id, body)
    )
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
    return this.commandBus.execute(
      new UpdateNoteCommand(organizationId, user.id, id, body)
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
    return this.commandBus.execute(
      new DeleteNoteCommand(organizationId, user.id, id)
    )
  }
}
