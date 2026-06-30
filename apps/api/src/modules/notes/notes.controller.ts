import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from "@nestjs/common"
import { CommandBus, QueryBus } from "@nestjs/cqrs"
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger"
import type { JWTClaims } from "@workspace/auth/types"
import {
  BulkDeleteNotesSchema,
  CreateNoteSchema,
  NotesListResponseSchema,
  UpdateNoteSchema,
  type BulkDeleteNotesInput,
  type CreateNoteInput,
  type UpdateNoteInput,
} from "@workspace/contracts"
import { CurrentUser } from "../../common/decorators"
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe"
import { BulkDeleteNotesCommand } from "./commands/bulk-delete-notes.command"
import { CreateNoteCommand } from "./commands/create-note.command"
import { DeleteNoteCommand } from "./commands/delete-note.command"
import { UpdateNoteCommand } from "./commands/update-note.command"
import { BulkDeleteNotesDto } from "./dto/bulk-delete-notes.dto"
import { CreateNoteDto } from "./dto/create-note.dto"
import { UpdateNoteDto } from "./dto/update-note.dto"
import { ListNotesQuery } from "./queries/list-notes.query"

@ApiTags("notes")
@Controller({ path: "notes", version: "1" })
export class NotesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Get()
  @ApiBearerAuth("bearer")
  @ApiOperation({ summary: "List notes for the current user" })
  @ApiOkResponse({ description: "User notes" })
  async list(@CurrentUser() user: JWTClaims) {
    const items = await this.queryBus.execute(new ListNotesQuery(user.id))
    return NotesListResponseSchema.parse({ items })
  }

  @Post()
  @ApiBearerAuth("bearer")
  @ApiOperation({ summary: "Create a note" })
  @ApiCreatedResponse({ description: "Created note" })
  @ApiBody({ type: CreateNoteDto })
  create(
    @CurrentUser() user: JWTClaims,
    @Body(new ZodValidationPipe(CreateNoteSchema)) body: CreateNoteInput
  ) {
    return this.commandBus.execute(new CreateNoteCommand(user.id, body))
  }

  @Post("bulk-delete")
  @ApiBearerAuth("bearer")
  @ApiOperation({ summary: "Delete multiple notes" })
  @ApiOkResponse({ description: "Bulk delete result" })
  @ApiBody({ type: BulkDeleteNotesDto })
  bulkDelete(
    @CurrentUser() user: JWTClaims,
    @Body(new ZodValidationPipe(BulkDeleteNotesSchema))
    body: BulkDeleteNotesInput
  ) {
    return this.commandBus.execute(new BulkDeleteNotesCommand(user.id, body))
  }

  @Patch(":id")
  @ApiBearerAuth("bearer")
  @ApiOperation({ summary: "Update a note" })
  @ApiOkResponse({ description: "Updated note" })
  @ApiBody({ type: UpdateNoteDto })
  update(
    @CurrentUser() user: JWTClaims,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateNoteSchema)) body: UpdateNoteInput
  ) {
    return this.commandBus.execute(new UpdateNoteCommand(user.id, id, body))
  }

  @Delete(":id")
  @HttpCode(204)
  @ApiBearerAuth("bearer")
  @ApiOperation({ summary: "Delete a note" })
  remove(@CurrentUser() user: JWTClaims, @Param("id") id: string) {
    return this.commandBus.execute(new DeleteNoteCommand(user.id, id))
  }
}
