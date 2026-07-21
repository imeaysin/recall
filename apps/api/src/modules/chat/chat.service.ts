import { Injectable } from "@nestjs/common"
import type {
  ChatListResponse,
  ChatMessagesQuery,
  ChatMessagesResponse,
  ChatResponse,
  CreateChat,
  SendChatMessage,
  UpdateChat,
} from "@workspace/contracts"
import type { ChatActorScope, ChatMutationScope } from "./domain"
import { ChatNotFoundException } from "./domain"
import {
  ChatCommandRepository,
  ChatContentLookupRepository,
  ChatMessageQueryRepository,
  ChatQueryRepository,
} from "./repository"
import {
  collectCitationContentIds,
  toChatMessageResponse,
  toChatResponse,
} from "./dto"
import { ChatSendMessageService } from "./chat-send-message.service"

@Injectable()
export class ChatService {
  constructor(
    private readonly chatQuery: ChatQueryRepository,
    private readonly chatCommand: ChatCommandRepository,
    private readonly messageQuery: ChatMessageQueryRepository,
    private readonly contentLookup: ChatContentLookupRepository,
    private readonly sendMessageService: ChatSendMessageService
  ) {}

  async list(scope: ChatActorScope): Promise<ChatListResponse> {
    const items = await this.chatQuery.listActiveForUser(scope.userId)
    return { items: items.map(toChatResponse) }
  }

  async create(
    scope: ChatActorScope,
    input: CreateChat
  ): Promise<ChatResponse> {
    const entity = await this.chatCommand.create({
      userId: scope.userId,
      title: input.title,
    })
    return toChatResponse(entity)
  }

  async rename(
    scope: ChatMutationScope,
    input: UpdateChat
  ): Promise<ChatResponse> {
    const entity = await this.chatCommand.rename({
      userId: scope.userId,
      chatId: scope.chatId,
      title: input.title,
    })
    if (!entity) throw new ChatNotFoundException()
    return toChatResponse(entity)
  }

  async softDelete(scope: ChatMutationScope): Promise<void> {
    const deleted = await this.chatCommand.softDelete(scope)
    if (!deleted) throw new ChatNotFoundException()
  }

  async listMessages(input: {
    readonly scope: ChatMutationScope
    readonly query: ChatMessagesQuery
  }): Promise<ChatMessagesResponse> {
    const chat = await this.chatQuery.findActiveByIdForUser(input.scope)
    if (!chat) throw new ChatNotFoundException()

    const messages = await this.messageQuery.listPage({
      chatId: input.scope.chatId,
      query: input.query,
    })
    const contentIds = collectCitationContentIds(messages)
    const contentMeta = await this.contentLookup.findCitationMetaByIds({
      userId: input.scope.userId,
      contentIds,
    })
    return {
      items: messages.map((message) =>
        toChatMessageResponse({ message, contentMeta })
      ),
    }
  }

  sendMessage(scope: ChatMutationScope, body: SendChatMessage) {
    return this.sendMessageService.send({ ...scope, body })
  }
}
