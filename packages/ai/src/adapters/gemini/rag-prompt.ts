import type { RagAnswer, RagCitation } from "../../types"

export function buildRagSystemPrompt(chunks: readonly RagCitation[]): string {
  const contextBlock =
    chunks.length === 0
      ? "(none)"
      : chunks
          .map(
            (chunk, index) =>
              `[${index + 1}] contentId=${chunk.contentId} title=${chunk.title}\n${chunk.chunkText}`
          )
          .join("\n\n")

  return `You answer using ONLY the user's saved library excerpts below. Cite sources as [n] matching the excerpt numbers. If nothing relevant exists, say so clearly — do not fabricate.\n\nLIBRARY EXCERPTS:\n${contextBlock}`
}

export function finalizeRagAnswer(config: {
  readonly text: string
  readonly contextChunks: readonly RagCitation[]
  readonly totalTokens: number | undefined
}): RagAnswer {
  return {
    text: config.text,
    citations: selectCitedChunks(config.text, config.contextChunks),
    tokensUsed: finiteTokenCount(config.totalTokens),
  }
}

function finiteTokenCount(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0
  return value
}

function selectCitedChunks(
  answerText: string,
  chunks: readonly RagCitation[]
): readonly RagCitation[] {
  const citedIndexes = new Set(
    [...answerText.matchAll(/\[(\d+)\]/g)].map((match) => Number(match[1]) - 1)
  )
  return chunks.filter((_chunk, index) => citedIndexes.has(index))
}
