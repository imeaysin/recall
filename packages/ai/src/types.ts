export type AiProviderKind = "GEMINI_FLASH" | "GEMINI_EMBEDDING"

export const AI_PROVIDER: {
  readonly GEMINI_FLASH: AiProviderKind
  readonly GEMINI_EMBEDDING: AiProviderKind
} = {
  GEMINI_FLASH: "GEMINI_FLASH",
  GEMINI_EMBEDDING: "GEMINI_EMBEDDING",
}

export const DEFAULT_EMBEDDING_MODEL = "gemini-embedding-2"
/** Keep RAG vectors at 768 dims (Google-recommended truncation for gemini-embedding-2). */
export const EMBEDDING_OUTPUT_DIMENSIONS = 768
export const CHUNK_TARGET_TOKENS = 500
export const CHUNK_OVERLAP_TOKENS = 50
export const CHARS_PER_TOKEN_ESTIMATE = 4
export const METADATA_TEXT_CHAR_LIMIT = 120_000

export type ContentMetadata = {
  readonly title: string
  readonly summary: string
  readonly topics: readonly string[]
}

export type EmbeddingResult = {
  readonly embeddings: readonly (readonly number[])[]
  readonly embeddingModel: string
  readonly tokensUsed: number
}

export type ChatMessage = {
  readonly role: "user" | "assistant" | "system"
  readonly content: string
}

export type RagCitation = {
  readonly contentId: string
  readonly title: string
  readonly sourceUrl?: string
  readonly chunkText: string
}

export type RagAnswer = {
  readonly text: string
  readonly citations: readonly RagCitation[]
  readonly tokensUsed: number
}

export class AiQuotaExceededError extends Error {
  readonly code = "AI_QUOTA_EXCEEDED"

  constructor(message = "AI provider daily/rate quota reached") {
    super(message)
    this.name = "AiQuotaExceededError"
  }
}

export class AiProviderError extends Error {
  readonly code = "AI_ERROR"

  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = "AiProviderError"
  }
}

export type AiUsageIncrementInput = {
  readonly provider: AiProviderKind
  readonly requests?: number
  readonly tokens?: number
}

export type AiUsageSnapshot = {
  readonly requestCount: number
  readonly tokenCount: number
}

export type AiUsageStore = {
  incrementDaily(input: AiUsageIncrementInput): Promise<AiUsageSnapshot>
  recordQuotaExceeded(provider: AiProviderKind): Promise<void>
}

export type AnswerWithContextInput = {
  readonly messages: readonly ChatMessage[]
  readonly contextChunks: readonly RagCitation[]
}

export type AiClient = {
  generateMetadata(text: string): Promise<ContentMetadata>
  embed(texts: readonly string[]): Promise<EmbeddingResult>
  answerWithContext(input: AnswerWithContextInput): Promise<RagAnswer>
}
