import { streamText } from "ai"
import { assertWithinDailyQuota } from "../../quota-gate"
import {
  AI_PROVIDER,
  AiProviderError,
  type AnswerWithContextInput,
  type RagAnswer,
  type RagCitation,
} from "../../types"
import type { GeminiRuntime } from "./runtime"
import { rethrowAiFailure } from "../../errors"
import { buildRagSystemPrompt, finalizeRagAnswer } from "./rag-prompt"

export async function answerWithContext(
  runtime: GeminiRuntime,
  input: AnswerWithContextInput
): Promise<RagAnswer> {
  return streamAnswerWithContext({
    runtime,
    input,
    onToken: () => undefined,
  })
}

export async function streamAnswerWithContext(config: {
  readonly runtime: GeminiRuntime
  readonly input: AnswerWithContextInput
  readonly onToken: (chunk: string) => void
}): Promise<RagAnswer> {
  const stream = await startAnswerStream(config.runtime, config.input)
  let text = ""
  for await (const chunk of stream.textStream) {
    text += chunk
    config.onToken(chunk)
  }
  return finalizeRagAnswer({
    text,
    contextChunks: config.input.contextChunks,
    totalTokens: await stream.totalTokens,
  })
}

async function startAnswerStream(
  runtime: GeminiRuntime,
  input: AnswerWithContextInput
) {
  await assertWithinDailyQuota({
    store: runtime.usageStore,
    provider: AI_PROVIDER.GEMINI_FLASH,
    dailyCap: runtime.flashDailyCap,
  })

  try {
    const result = streamText({
      model: runtime.google(runtime.flashModel),
      system: buildRagSystemPrompt(input.contextChunks),
      messages: input.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    })
    return {
      textStream: result.textStream,
      totalTokens: result.usage.then((usage) => usage?.totalTokens),
    }
  } catch (error) {
    if (!(error instanceof Error)) {
      throw new AiProviderError("RAG completion failed")
    }
    rethrowAiFailure(error, "RAG completion failed")
  }
}
