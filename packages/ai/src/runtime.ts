import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { aiEnv } from "@workspace/config/ai"
import { AiProviderError, type AiUsageStore } from "./types"

type GoogleProvider = ReturnType<typeof createGoogleGenerativeAI>

export type GeminiRuntime = {
  readonly usageStore: AiUsageStore
  readonly google: GoogleProvider
  readonly flashModel: string
  readonly embeddingModel: string
  readonly flashDailyCap: number
  readonly embeddingDailyCap: number
}

export type CreateGeminiRuntimeOptions = {
  readonly usageStore: AiUsageStore
  readonly apiKey?: string
  readonly flashModel?: string
  readonly embeddingModel?: string
  readonly flashDailyCap?: number
  readonly embeddingDailyCap?: number
}

export function createGeminiRuntime(
  options: CreateGeminiRuntimeOptions
): GeminiRuntime {
  const apiKey = options.apiKey ?? aiEnv.GEMINI_API_KEY
  if (!apiKey) {
    throw new AiProviderError(
      "GEMINI_API_KEY is required to create the Gemini AI client"
    )
  }

  return {
    usageStore: options.usageStore,
    google: createGoogleGenerativeAI({ apiKey }),
    flashModel: options.flashModel ?? aiEnv.GEMINI_FLASH_MODEL,
    embeddingModel: options.embeddingModel ?? aiEnv.GEMINI_EMBEDDING_MODEL,
    flashDailyCap: options.flashDailyCap ?? aiEnv.AI_FLASH_DAILY_REQUEST_CAP,
    embeddingDailyCap:
      options.embeddingDailyCap ?? aiEnv.AI_EMBEDDING_DAILY_REQUEST_CAP,
  }
}
