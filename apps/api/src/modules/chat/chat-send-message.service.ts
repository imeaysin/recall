import { Injectable } from "@nestjs/common"
import type { SendChatMessageResponse } from "@workspace/contracts"
import {
  AiQuotaExceededError,
  type ChatMessage as AiChatMessage,
} from "@workspace/ai"
import { ChatAiClientProvider } from "./chat-ai-client.provider"
import {
  AiQuotaExceededException,
  ChatNotFoundException,
  buildLanguageCaveat,
  resolveAutoTitle,
  selectTopSimilarChunks,
  type ChatMessageEntity,
  type SendMessageScope,
} from "./domain"
import {
  buildRagCitations,
  buildStoredCitations,
  collectContentIdsFromChunks,
} from "./domain/citation-mapping"
import {
  ChatCommandRepository,
  ChatContentLookupRepository,
  ChatMessageCommandRepository,
  ChatMessageQueryRepository,
  ChatQueryRepository,
  VectorRetrievalRepository,
} from "./repository"
import { toChatMessageResponse } from "./dto"

@Injectable()
export class ChatSendMessageService {
  constructor(
    private readonly chatQuery: ChatQueryRepository,
    private readonly chatCommand: ChatCommandRepository,
    private readonly messageQuery: ChatMessageQueryRepository,
    private readonly messageCommand: ChatMessageCommandRepository,
    private readonly vectorRetrieval: VectorRetrievalRepository,
    private readonly contentLookup: ChatContentLookupRepository,
    private readonly aiProvider: ChatAiClientProvider
  ) {}

  async send(scope: SendMessageScope): Promise<SendChatMessageResponse> {
    const chat = await this.chatQuery.findActiveByIdForUser(scope)
    if (!chat) throw new ChatNotFoundException()

    const priorContext = await this.messageQuery.listContextBeforeSend(
      scope.chatId
    )
    const userMessage = await this.messageCommand.insert({
      chatId: scope.chatId,
      userId: scope.userId,
      role: "user",
      text: scope.body.text,
    })

    const assistantResult = await this.buildAssistantReply({
      scope,
      priorContext,
      userQuestion: scope.body.text,
      contentId: scope.body.contentId,
    })

    const autoTitle = resolveAutoTitle({
      currentTitle: chat.title,
      firstUserQuestion: scope.body.text,
    })
    await this.chatCommand.bumpAfterMessages({
      userId: scope.userId,
      chatId: scope.chatId,
      addedCount: 2,
      lastMessageAt: assistantResult.message.createdAt,
      title: autoTitle,
    })

    const userMeta = await this.contentLookup.findCitationMetaByIds({
      userId: scope.userId,
      contentIds: [],
    })
    const assistantMeta = assistantResult.contentMeta
    return {
      userMessage: toChatMessageResponse({
        message: userMessage,
        contentMeta: userMeta,
      }),
      assistantMessage: toChatMessageResponse({
        message: assistantResult.message,
        contentMeta: assistantMeta,
        languageCaveatOverride: assistantResult.languageCaveat,
      }),
    }
  }

  private async buildAssistantReply(input: {
    readonly scope: SendMessageScope
    readonly priorContext: readonly ChatMessageEntity[]
    readonly userQuestion: string
    readonly contentId?: string
  }) {
    try {
      const ai = this.aiProvider.getClient()
      const embedded = await ai.embed([input.userQuestion])
      const queryVector = embedded.embeddings[0]
      if (!queryVector) {
        throw new Error("Embedding returned no vector")
      }

      const candidates = await this.vectorRetrieval.loadCandidates({
        userId: input.scope.userId,
        contentId: input.contentId,
      })
      const topChunks = selectTopSimilarChunks({
        queryEmbedding: queryVector,
        chunks: candidates,
      })
      const chunkContentIds = collectContentIdsFromChunks(topChunks)
      const chunkMeta = await this.contentLookup.findCitationMetaByIds({
        userId: input.scope.userId,
        contentIds: chunkContentIds,
      })
      const languageCaveat = buildLanguageCaveat(
        [...chunkMeta.values()].map((meta) => meta.language)
      )
      const ragCitations = buildRagCitations({
        chunks: topChunks,
        contentMeta: chunkMeta,
      })
      const messages = toAiMessages(input.priorContext, input.userQuestion)
      const answer = await ai.answerWithContext({
        messages,
        contextChunks: ragCitations,
      })
      const storedCitations = buildStoredCitations({
        ragCitations: answer.citations,
        contentMeta: chunkMeta,
      })
      const message = await this.messageCommand.insert({
        chatId: input.scope.chatId,
        userId: input.scope.userId,
        role: "assistant",
        text: answer.text,
        citations: storedCitations,
        retrievedChunkIds: topChunks.map((chunk) => chunk.id),
        tokensUsed: answer.tokensUsed,
      })
      return { message, contentMeta: chunkMeta, languageCaveat }
    } catch (error) {
      if (error instanceof AiQuotaExceededError) {
        throw new AiQuotaExceededException()
      }
      throw error
    }
  }
}

function toAiMessages(
  prior: readonly ChatMessageEntity[],
  userQuestion: string
): readonly AiChatMessage[] {
  const history = prior.map((message) => ({
    role: message.role,
    content: message.text,
  }))
  return [...history, { role: "user" as const, content: userQuestion }]
}
