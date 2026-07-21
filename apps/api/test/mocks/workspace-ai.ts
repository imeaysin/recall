export class AiProviderError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AiProviderError"
  }
}

export class AiQuotaExceededError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AiQuotaExceededError"
  }
}

export type AiClient = {
  readonly generateMetadata: (text: string) => Promise<{
    readonly title: string
    readonly summary: string
    readonly topics: readonly string[]
  }>
  readonly embed: (texts: readonly string[]) => Promise<{
    readonly embeddings: readonly number[][]
    readonly embeddingModel: string
  }>
}

export function createGeminiAiClient(_options: {
  readonly usageStore?: object
}): AiClient {
  return {
    generateMetadata: async () => ({
      title: "AI title",
      summary: "AI summary",
      topics: ["testing"],
    }),
    embed: async (texts) => ({
      embeddings: texts.map(() => [0.1, 0.2, 0.3]),
      embeddingModel: "mock-embed",
    }),
  }
}

export function chunkText(text: string): string[] {
  return text.length === 0 ? [] : [text]
}
