export function normalizeUrl(url: string): string {
  return url.trim()
}

export function detectYoutubeVideoId(_url: string): string | null {
  return null
}

export function sha256Hex(input: string): string {
  return `hash:${input.length}`
}

export async function extractContent(_input: {
  readonly sourceType: string
  readonly url?: string
}): Promise<{
  readonly text: string
  readonly wordCount: number
  readonly titleHint?: string
}> {
  return {
    text: "mocked extracted text",
    wordCount: 3,
    titleHint: "Mocked title",
  }
}
