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
import { ChatService } from "./chat.service"
import {
  ChatApiResponseDto,
  ChatListApiResponseDto,
  ChatMessagesApiResponseDto,
  ChatMessagesQueryDto,
  CreateChatDto,
  SendChatMessageApiResponseDto,
  SendChatMessageDto,
  UpdateChatDto,
} from "./dto"

@ApiTags("chats")
@ApiAuthErrorResponses()
@Controller({ path: "chats", version: "1" })
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @ApiOperation({ summary: "List chats for the current user" })
  @ApiOkResponse({ type: ChatListApiResponseDto })
  list(@Session() session: UserSession) {
    return this.chatService.list({ userId: session.user.id })
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a chat" })
  @ApiCreatedResponse({ type: ChatApiResponseDto })
  create(@Session() session: UserSession, @Body() body: CreateChatDto) {
    return this.chatService.create({ userId: session.user.id }, body)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Rename a chat" })
  @ApiParam({ name: "id" })
  @ApiOkResponse({ type: ChatApiResponseDto })
  rename(
    @Session() session: UserSession,
    @Param("id") id: string,
    @Body() body: UpdateChatDto
  ) {
    return this.chatService.rename(
      { userId: session.user.id, chatId: id },
      body
    )
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Soft-delete a chat" })
  @ApiParam({ name: "id" })
  @ApiNoContentResponse()
  async remove(@Session() session: UserSession, @Param("id") id: string) {
    await this.chatService.softDelete({
      userId: session.user.id,
      chatId: id,
    })
  }

  @Get(":id/messages")
  @ApiOperation({ summary: "List chat messages (chronological)" })
  @ApiParam({ name: "id" })
  @ApiOkResponse({ type: ChatMessagesApiResponseDto })
  listMessages(
    @Session() session: UserSession,
    @Param("id") id: string,
    @Query() query: ChatMessagesQueryDto
  ) {
    return this.chatService.listMessages({
      scope: { userId: session.user.id, chatId: id },
      query,
    })
  }

  @Post(":id/messages")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Send a message and receive a RAG answer" })
  @ApiParam({ name: "id" })
  @ApiCreatedResponse({ type: SendChatMessageApiResponseDto })
  sendMessage(
    @Session() session: UserSession,
    @Param("id") id: string,
    @Body() body: SendChatMessageDto
  ) {
    return this.chatService.sendMessage(
      { userId: session.user.id, chatId: id },
      body
    )
  }
}
