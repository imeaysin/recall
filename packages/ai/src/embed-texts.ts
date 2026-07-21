import { embedMany } from "ai"
import { assertWithinDailyQuota } from "./quota-gate"
import { AI_PROVIDER, AiProviderError, type EmbeddingResult } from "./types"
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
      model: runtime.google.textEmbeddingModel(runtime.embeddingModel),
      values: [...texts],
    })
    const tokensUsed = usage?.tokens ?? 0
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
