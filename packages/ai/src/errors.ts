import { AiProviderError, AiQuotaExceededError } from "./types"

export function rethrowAiFailure(error: Error, fallbackMessage: string): never {
  if (error instanceof AiQuotaExceededError) throw error
  if (error instanceof AiProviderError) throw error
  throw new AiProviderError(fallbackMessage, { cause: error })
}
