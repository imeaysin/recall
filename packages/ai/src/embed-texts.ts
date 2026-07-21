import { embedMany } from "ai"
import { assertWithinDailyQuota } from "./quota-gate"
import {
  AI_PROVIDER,
  AiProviderError,
  EMBEDDING_OUTPUT_DIMENSIONS,
  type EmbeddingResult,
} from "./types"
import type { GeminiRuntime } from "./runtime"
import { rethrowAiFailure } from "./errors"

export async function embedTexts(
  runtime: GeminiRuntime,
  texts: readonly string[]
): Promise<EmbeddingResult> {
  if (texts.length === 0) {
    return {
      embeddings: [],
      embeddingModel: runtime.embeddingModel,
      tokensUsed: 0,
    }
  }

  await assertWithinDailyQuota({
    store: runtime.usageStore,
    provider: AI_PROVIDER.GEMINI_EMBEDDING,
    dailyCap: runtime.embeddingDailyCap,
  })

  try {
    const { embeddings, usage } = await embedMany({
      model: runtime.google.embedding(runtime.embeddingModel),
      values: [...texts],
      providerOptions: {
        google: {
          outputDimensionality: EMBEDDING_OUTPUT_DIMENSIONS,
        },
      },
    })
    const tokensUsed = finiteTokenCount(usage?.tokens)
    await recordTokenUsage(runtime, tokensUsed)
    return {
      embeddings,
      embeddingModel: runtime.embeddingModel,
      tokensUsed,
    }
  } catch (error) {
    if (!(error instanceof Error)) {
      throw new AiProviderError("Embedding generation failed")
    }
    rethrowAiFailure(error, "Embedding generation failed")
  }
}

function finiteTokenCount(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0
  return value
}

async function recordTokenUsage(
  runtime: GeminiRuntime,
  tokensUsed: number
): Promise<void> {
  if (tokensUsed <= 0) return
  await runtime.usageStore.incrementDaily({
    provider: AI_PROVIDER.GEMINI_EMBEDDING,
    requests: 0,
    tokens: tokensUsed,
  })
}
