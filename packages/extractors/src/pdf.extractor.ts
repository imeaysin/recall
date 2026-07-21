import pdfParse from "pdf-parse"
import type { ContentExtractor, ExtractInput, ExtractResult } from "./types"
import { ExtractionError } from "./types"
import { wordCount } from "./normalize-url"

export const pdfExtractor: ContentExtractor = {
  sourceType: "PDF",

  async extract(input: ExtractInput): Promise<ExtractResult> {
    if (!input.buffer) {
      throw new ExtractionError("EXTRACTION_FAILED", "PDF buffer is required")
    }
    if (
      input.mimeType &&
      input.mimeType !== "application/pdf" &&
      !input.originalName?.toLowerCase().endsWith(".pdf")
    ) {
      throw new ExtractionError(
        "UNSUPPORTED_FORMAT",
        "Expected application/pdf"
      )
    }

    try {
      const parsed = await pdfParse(input.buffer)
      const text = (parsed.text ?? "").trim()
      if (!text) {
        throw new ExtractionError(
          "EXTRACTION_FAILED",
          "PDF contained no extractable text"
        )
      }
      return {
        text,
        titleHint: parsed.info?.Title?.trim() || undefined,
        wordCount: wordCount(text),
      }
    } catch (error) {
      if (error instanceof ExtractionError) throw error
      throw new ExtractionError("EXTRACTION_FAILED", "PDF extraction failed", {
        cause: error,
      })
    }
  },
}
