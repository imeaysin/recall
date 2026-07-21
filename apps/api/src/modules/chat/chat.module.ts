import { Module } from "@nestjs/common"
import { IngestionModule } from "@/modules/ingestion/ingestion.module"
import { ChatController } from "./chat.controller"
import { ChatService } from "./chat.service"
import { ChatSendMessageService } from "./chat-send-message.service"
import { ChatAiClientProvider } from "./chat-ai-client.provider"
import {
  ChatCommandRepository,
  ChatContentLookupRepository,
  ChatMessageCommandRepository,
  ChatMessageQueryRepository,
  ChatQueryRepository,
  VectorRetrievalRepository,
} from "./repository"

@Module({
  imports: [IngestionModule],
  controllers: [ChatController],
  providers: [
    ChatQueryRepository,
    ChatCommandRepository,
    ChatMessageQueryRepository,
    ChatMessageCommandRepository,
    VectorRetrievalRepository,
    ChatContentLookupRepository,
    ChatAiClientProvider,
    ChatSendMessageService,
    ChatService,
  ],
})
export class ChatModule {}
