import type { AiClient } from "./types"
import { createGeminiRuntime, type CreateGeminiRuntimeOptions } from "./runtime"
import { generateMetadata } from "./generate-metadata"
import { embedTexts } from "./embed-texts"
import { answerWithContext } from "./answer-with-context"

export type CreateGeminiAiClientOptions = CreateGeminiRuntimeOptions

export function createGeminiAiClient(
  options: CreateGeminiAiClientOptions
): AiClient {
  const runtime = createGeminiRuntime(options)
  return {
    generateMetadata: (text) => generateMetadata(runtime, text),
    embed: (texts) => embedTexts(runtime, texts),
    answerWithContext: (input) => answerWithContext(runtime, input),
  }
}
