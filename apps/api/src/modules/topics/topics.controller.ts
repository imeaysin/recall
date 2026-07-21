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
import { TopicsService } from "./topics.service"
import {
  CreateTopicDto,
  DeleteTopicDto,
  MergeTopicDto,
  TopicApiResponseDto,
  TopicListApiResponseDto,
  TopicListQueryDto,
  UpdateTopicDto,
} from "./dto"

@ApiTags("topics")
@ApiAuthErrorResponses()
@Controller({ path: "topics", version: "1" })
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  @ApiOperation({ summary: "List topics for the current user" })
  @ApiOkResponse({ type: TopicListApiResponseDto })
  async list(
    @Session() session: UserSession,
    @Query() query: TopicListQueryDto
  ) {
    return this.topicsService.list({ userId: session.user.id }, query)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a user-defined topic" })
  @ApiCreatedResponse({ type: TopicApiResponseDto })
  async create(@Session() session: UserSession, @Body() body: CreateTopicDto) {
    return this.topicsService.create({ userId: session.user.id }, body)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Rename a topic (not the library root)" })
  @ApiParam({ name: "id" })
  @ApiOkResponse({ type: TopicApiResponseDto })
  async rename(
    @Session() session: UserSession,
    @Param("id") id: string,
    @Body() body: UpdateTopicDto
  ) {
    return this.topicsService.rename(
      { userId: session.user.id, topicId: id },
      body
    )
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a user-created topic" })
  @ApiParam({ name: "id" })
  @ApiNoContentResponse()
  async remove(
    @Session() session: UserSession,
    @Param("id") id: string,
    @Body() _body: DeleteTopicDto
  ) {
    await this.topicsService.remove({ userId: session.user.id, topicId: id })
  }

  @Post(":id/merge")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Merge a topic into another topic" })
  @ApiParam({ name: "id" })
  @ApiOkResponse({ type: TopicApiResponseDto })
  async merge(
    @Session() session: UserSession,
    @Param("id") id: string,
    @Body() body: MergeTopicDto
  ) {
    return this.topicsService.merge(
      { userId: session.user.id, topicId: id },
      body
    )
  }
}
