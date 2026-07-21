export function normalizeUrl(url: string): string {
  return url.trim()
}

export function detectYoutubeVideoId(_url: string): string | null {
  return null
}

export function sha256Hex(input: string): string {
  return `hash:${input.length}`
}

export class ExtractionError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = "ExtractionError"
    this.code = code
  }
}

export async function extractContent(input: {
  readonly sourceType: string
  readonly url?: string
  readonly buffer?: Buffer
  readonly mimeType?: string
  readonly originalName?: string
}): Promise<{
  readonly text: string
  readonly wordCount: number
  readonly titleHint?: string
  readonly language?: string
}> {
  if (input.sourceType === "PDF" && !input.buffer) {
    throw new ExtractionError("EXTRACTION_FAILED", "PDF buffer is required")
  }
  return {
    text: "mocked extracted text",
    wordCount: 3,
    titleHint: "Mocked title",
    language: "en",
  }
}
