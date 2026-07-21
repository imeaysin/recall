import type { ContentExtractor, ExtractInput, ExtractResult } from "./types"
import { ExtractionError } from "./types"

/**
 * Image OCR — MVP stub.
 * Production should wire an OCR provider (e.g. Tesseract / Gemini vision).
 * Until then, fail with a structured code so the UI can show a clear error.
 */
export const imageExtractor: ContentExtractor = {
  sourceType: "IMAGE",

  async extract(input: ExtractInput): Promise<ExtractResult> {
    if (!input.buffer) {
      throw new ExtractionError("EXTRACTION_FAILED", "Image buffer is required")
    }
    const mime = input.mimeType ?? ""
    if (mime && !mime.startsWith("image/")) {
      throw new ExtractionError(
        "UNSUPPORTED_FORMAT",
        "Expected an image MIME type"
      )
    }

    throw new ExtractionError(
      "UNSUPPORTED_FORMAT",
      "Image OCR is not enabled yet — use article, YouTube, or PDF sources"
    )
  },
}
