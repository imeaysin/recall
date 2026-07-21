import type { AiClient } from "./types"
import {
  createGeminiRuntime,
  type CreateGeminiRuntimeOptions,
} from "./adapters/gemini/runtime"
import { generateMetadata } from "./adapters/gemini/generate-metadata"
import { embedTexts } from "./adapters/gemini/embed-texts"
import {
  answerWithContext,
  streamAnswerWithContext,
} from "./adapters/gemini/answer-with-context"

export type CreateGeminiAiClientOptions = CreateGeminiRuntimeOptions

export function createGeminiAiClient(
  options: CreateGeminiAiClientOptions
): AiClient {
  const runtime = createGeminiRuntime(options)
  return {
    generateMetadata: (text) => generateMetadata(runtime, text),
    embed: (texts) => embedTexts(runtime, texts),
    answerWithContext: (input) => answerWithContext(runtime, input),
    streamAnswerWithContext: (input, onToken) =>
      streamAnswerWithContext({ runtime, input, onToken }),
  }
}
