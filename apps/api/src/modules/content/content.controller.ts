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
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger"
import {
  CONTENT_UPLOAD_MAX_BYTES,
  ContentTrashListApiResponseSchema,
} from "@workspace/contracts"
import { ingestionEnv } from "@workspace/config/ingestion"
import { createZodDto } from "nestjs-zod"
import { Session, type UserSession } from "@/common/decorators"
import { ApiAuthErrorResponses } from "@/common/decorators/api-error-responses.decorator"
import { ContentService } from "./content.service"
import { InvalidContentUpdateException } from "./domain"
import {
  ContentApiResponseDto,
  ContentListApiResponseDto,
  ContentListQueryDto,
  SaveUrlContentDto,
  UpdateContentDto,
} from "./dto"

class ContentTrashListApiResponseDto extends createZodDto(
  ContentTrashListApiResponseSchema
) {}

type UploadedPdf = {
  readonly buffer: Buffer
  readonly mimetype: string
  readonly originalname: string
  readonly size: number
}

@ApiTags("content")
@ApiAuthErrorResponses()
@Controller({ path: "content", version: "1" })
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post("url")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Save a URL for async ingestion (returns within 500ms)",
  })
  @ApiCreatedResponse({ type: ContentApiResponseDto })
  async saveUrl(
    @Session() session: UserSession,
    @Body() body: SaveUrlContentDto
  ) {
    return this.contentService.saveUrl({ userId: session.user.id }, body)
  }

  @Post("file")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Upload a PDF for async ingestion (max 15MB)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
      },
      required: ["file"],
    },
  })
  @ApiCreatedResponse({ type: ContentApiResponseDto })
  @UseInterceptors(
    FileInterceptor("file", {
      limits: {
        fileSize: Math.max(
          CONTENT_UPLOAD_MAX_BYTES,
          ingestionEnv.CONTENT_UPLOAD_MAX_BYTES
        ),
        files: 1,
      },
    })
  )
  async saveFile(
    @Session() session: UserSession,
    @UploadedFile() file?: UploadedPdf
  ) {
    if (!file) {
      throw new InvalidContentUpdateException("File is required")
    }
    return this.contentService.savePdf({ userId: session.user.id }, file)
  }

  @Get("trash")
  @ApiOperation({ summary: "List soft-deleted content in trash" })
  @ApiOkResponse({ type: ContentTrashListApiResponseDto })
  async listTrash(@Session() session: UserSession) {
    return this.contentService.listTrash({ userId: session.user.id })
  }

  @Post("trash/:trashId/restore")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Restore content from trash" })
  @ApiParam({ name: "trashId" })
  @ApiOkResponse({ type: ContentApiResponseDto })
  async restoreTrash(
    @Session() session: UserSession,
    @Param("trashId") trashId: string
  ) {
    return this.contentService.restoreTrash({
      userId: session.user.id,
      trashId,
    })
  }

  @Get()
  @ApiOperation({ summary: "List library content" })
  @ApiOkResponse({ type: ContentListApiResponseDto })
  async list(
    @Session() session: UserSession,
    @Query() query: ContentListQueryDto
  ) {
    return this.contentService.list({ userId: session.user.id }, query)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get content by id" })
  @ApiParam({ name: "id" })
  @ApiOkResponse({ type: ContentApiResponseDto })
  async getOne(@Session() session: UserSession, @Param("id") id: string) {
    return this.contentService.getById({
      userId: session.user.id,
      contentId: id,
    })
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update content metadata or library status" })
  @ApiParam({ name: "id" })
  @ApiOkResponse({ type: ContentApiResponseDto })
  async update(
    @Session() session: UserSession,
    @Param("id") id: string,
    @Body() body: UpdateContentDto
  ) {
    return this.contentService.update(
      { userId: session.user.id, contentId: id },
      body
    )
  }

  @Post(":id/retry")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Retry failed ingestion from the beginning" })
  @ApiParam({ name: "id" })
  @ApiOkResponse({ type: ContentApiResponseDto })
  async retry(@Session() session: UserSession, @Param("id") id: string) {
    return this.contentService.retry({
      userId: session.user.id,
      contentId: id,
    })
  }

  @Post(":id/regenerate")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Regenerate AI metadata (overrides user-edited title/summary)",
  })
  @ApiParam({ name: "id" })
  @ApiOkResponse({ type: ContentApiResponseDto })
  async regenerate(@Session() session: UserSession, @Param("id") id: string) {
    return this.contentService.regenerate({
      userId: session.user.id,
      contentId: id,
    })
  }

  @Delete(":id/permanent")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Permanently delete content and its vectors" })
  @ApiParam({ name: "id" })
  @ApiNoContentResponse()
  async permanentDelete(
    @Session() session: UserSession,
    @Param("id") id: string
  ) {
    await this.contentService.permanentDelete({
      userId: session.user.id,
      contentId: id,
    })
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Soft-delete content" })
  @ApiParam({ name: "id" })
  @ApiNoContentResponse()
  async remove(@Session() session: UserSession, @Param("id") id: string) {
    await this.contentService.softDelete({
      userId: session.user.id,
      contentId: id,
    })
  }
}
