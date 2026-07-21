import { generateText } from "ai"
import { assertWithinDailyQuota } from "./quota-gate"
import {
  AI_PROVIDER,
  AiProviderError,
  type AnswerWithContextInput,
  type RagAnswer,
  type RagCitation,
} from "./types"
import type { GeminiRuntime } from "./runtime"
import { rethrowAiFailure } from "./errors"

export async function answerWithContext(
  runtime: GeminiRuntime,
  input: AnswerWithContextInput
): Promise<RagAnswer> {
  await assertWithinDailyQuota({
    store: runtime.usageStore,
    provider: AI_PROVIDER.GEMINI_FLASH,
    dailyCap: runtime.flashDailyCap,
  })

  try {
    const { text, usage } = await generateText({
      model: runtime.google(runtime.flashModel),
      system: buildRagSystemPrompt(input.contextChunks),
      messages: input.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    })

    return {
      text,
      citations: selectCitedChunks(text, input.contextChunks),
      tokensUsed: usage?.totalTokens ?? 0,
    }
  } catch (error) {
    if (!(error instanceof Error)) {
      throw new AiProviderError("RAG completion failed")
    }
    rethrowAiFailure(error, "RAG completion failed")
  }
}

function buildRagSystemPrompt(chunks: readonly RagCitation[]): string {
  const contextBlock =
    chunks.length === 0
      ? "(none)"
      : chunks
          .map(
            (chunk, index) =>
              `[${index + 1}] contentId=${chunk.contentId} title=${chunk.title}\n${chunk.chunkText}`
          )
          .join("\n\n")

  return `You answer using ONLY the user's saved library excerpts below. Cite sources as [n] matching the excerpt numbers. If nothing relevant exists, say so clearly — do not fabricate.\n\nLIBRARY EXCERPTS:\n${contextBlock}`
}

function selectCitedChunks(
  answerText: string,
  chunks: readonly RagCitation[]
): readonly RagCitation[] {
  const citedIndexes = new Set(
    [...answerText.matchAll(/\[(\d+)\]/g)].map((match) => Number(match[1]) - 1)
  )
  return chunks.filter((_chunk, index) => citedIndexes.has(index))
}
