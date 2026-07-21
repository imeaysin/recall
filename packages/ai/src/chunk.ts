import {
  CHARS_PER_TOKEN_ESTIMATE,
  CHUNK_OVERLAP_TOKENS,
  CHUNK_TARGET_TOKENS,
} from "./types"

export type ChunkTextOptions = {
  readonly targetTokens?: number
  readonly overlapTokens?: number
}

export function chunkText(
  text: string,
  options: ChunkTextOptions = {}
): string[] {
  const targetTokens = options.targetTokens ?? CHUNK_TARGET_TOKENS
  const overlapTokens = options.overlapTokens ?? CHUNK_OVERLAP_TOKENS
  const targetChars = targetTokens * CHARS_PER_TOKEN_ESTIMATE
  const overlapChars = overlapTokens * CHARS_PER_TOKEN_ESTIMATE
  const normalized = text.replace(/\s+/g, " ").trim()

  if (!normalized) return []
  if (normalized.length <= targetChars) return [normalized]

  return splitOverlappingChunks({
    text: normalized,
    targetChars,
    overlapChars,
    start: 0,
  })
}

function splitOverlappingChunks(input: {
  readonly text: string
  readonly targetChars: number
  readonly overlapChars: number
  readonly start: number
}): string[] {
  const { text, targetChars, overlapChars, start } = input
  if (start >= text.length) return []

  const end = Math.min(start + targetChars, text.length)
  const slice = text.slice(start, end).trim()
  const nextStart =
    end >= text.length ? text.length : Math.max(end - overlapChars, start + 1)
  const rest = splitOverlappingChunks({
    text,
    targetChars,
    overlapChars,
    start: nextStart,
  })

  return slice.length > 0 ? [slice, ...rest] : rest
}
