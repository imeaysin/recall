import { createEnv } from "../validate"
import { aiEnvSchema, pickServerDefaults, type AiEnv } from "../schemas/server"

/** Gemini / AI provider config — consumed by `@workspace/ai`. */
export const aiEnv = createEnv(
  aiEnvSchema,
  pickServerDefaults([
    "GEMINI_API_KEY",
    "GEMINI_FLASH_MODEL",
    "GEMINI_EMBEDDING_MODEL",
    "AI_FLASH_DAILY_REQUEST_CAP",
    "AI_EMBEDDING_DAILY_REQUEST_CAP",
  ])
)

export type { AiEnv }
