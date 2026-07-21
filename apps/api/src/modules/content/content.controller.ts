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
} from "@nestjs/common"
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger"
import { Session, type UserSession } from "@/common/decorators"
import { ApiAuthErrorResponses } from "@/common/decorators/api-error-responses.decorator"
import { ContentService } from "./content.service"
import {
  ContentApiResponseDto,
  ContentListApiResponseDto,
  ContentListQueryDto,
  SaveUrlContentDto,
  UpdateContentDto,
} from "./dto"

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
  @ApiOperation({ summary: "Retry failed ingestion from the beginning" })
  @ApiParam({ name: "id" })
  @ApiOkResponse({ type: ContentApiResponseDto })
  async retry(@Session() session: UserSession, @Param("id") id: string) {
    return this.contentService.retry({
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
