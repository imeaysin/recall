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
    readonly embeddings: readonly (readonly number[])[]
    readonly embeddingModel: string
    readonly tokensUsed: number
  }>
  readonly answerWithContext: (input: {
    readonly messages: readonly {
      readonly role: "user" | "assistant" | "system"
      readonly content: string
    }[]
    readonly contextChunks: readonly {
      readonly contentId: string
      readonly title: string
      readonly sourceUrl?: string
      readonly chunkText: string
    }[]
  }) => Promise<{
    readonly text: string
    readonly citations: readonly {
      readonly contentId: string
      readonly title: string
      readonly sourceUrl?: string
      readonly chunkText: string
    }[]
    readonly tokensUsed: number
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
      tokensUsed: texts.length,
    }),
    answerWithContext: async (input) => {
      const firstChunk = input.contextChunks[0]
      return {
        text: firstChunk
          ? `Answer citing [1] from library.`
          : "No relevant content found in your library.",
        citations: firstChunk
          ? [
              {
                contentId: firstChunk.contentId,
                title: firstChunk.title,
                sourceUrl: firstChunk.sourceUrl,
                chunkText: firstChunk.chunkText,
              },
            ]
          : [],
        tokensUsed: 12,
      }
    },
  }
}

export function chunkText(text: string): string[] {
  return text.length === 0 ? [] : [text]
}
