import type { VectorChunkEntity } from "./chat.model"
import { CHAT_RETRIEVAL_TOP_K } from "./constants"

export function cosineSimilarity(
  left: readonly number[],
  right: readonly number[]
): number {
  const length = Math.min(left.length, right.length)
  let dot = 0
  let normLeft = 0
  let normRight = 0
  for (let index = 0; index < length; index += 1) {
    const leftValue = left[index] ?? 0
    const rightValue = right[index] ?? 0
    dot += leftValue * rightValue
    normLeft += leftValue * leftValue
    normRight += rightValue * rightValue
  }
  if (normLeft === 0 || normRight === 0) return 0
  return dot / (Math.sqrt(normLeft) * Math.sqrt(normRight))
}

export function selectTopSimilarChunks(input: {
  readonly queryEmbedding: readonly number[]
  readonly chunks: readonly VectorChunkEntity[]
  readonly topK?: number
}): readonly VectorChunkEntity[] {
  const topK = input.topK ?? CHAT_RETRIEVAL_TOP_K
  const ranked = input.chunks.map((chunk) => ({
    chunk,
    score: cosineSimilarity(input.queryEmbedding, chunk.embedding),
  }))
  return [...ranked]
    .sort((left, right) => right.score - left.score)
    .slice(0, topK)
    .map((entry) => entry.chunk)
}
