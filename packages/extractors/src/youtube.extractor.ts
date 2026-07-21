import { YoutubeTranscript } from "youtube-transcript"
import type { ContentExtractor, ExtractInput, ExtractResult } from "./types"
import { ExtractionError } from "./types"
import { detectYoutubeVideoId, wordCount } from "./normalize-url"
import { detectLanguageHint } from "./detect-language"

export const youtubeExtractor: ContentExtractor = {
  sourceType: "YOUTUBE",

  async extract(input: ExtractInput): Promise<ExtractResult> {
    if (!input.url) {
      throw new ExtractionError("EXTRACTION_FAILED", "YouTube URL is required")
    }

    const videoId = detectYoutubeVideoId(input.url)
    if (!videoId) {
      throw new ExtractionError(
        "UNSUPPORTED_FORMAT",
        "Not a recognized YouTube URL"
      )
    }

    try {
      const segments = await YoutubeTranscript.fetchTranscript(videoId)
      const text = segments
        .map((segment) => segment.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()

      if (!text) {
        throw new ExtractionError(
          "EXTRACTION_FAILED",
          "YouTube video has no available captions"
        )
      }

      return {
        text,
        language: detectLanguageHint(text),
        wordCount: wordCount(text),
      }
    } catch (error) {
      if (error instanceof ExtractionError) throw error
      throw new ExtractionError(
        "EXTRACTION_FAILED",
        "YouTube video has no available captions",
        { cause: error }
      )
    }
  },
}
