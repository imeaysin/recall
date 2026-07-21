import { JSDOM } from "jsdom"
import { Readability } from "@mozilla/readability"
import type { ContentExtractor, ExtractInput, ExtractResult } from "../types"
import { ExtractionError } from "../types"
import { wordCount } from "../lib/normalize-url"
import { detectLanguageHint } from "../lib/detect-language"

export const articleExtractor: ContentExtractor = {
  sourceType: "ARTICLE",

  async extract(input: ExtractInput): Promise<ExtractResult> {
    if (!input.url) {
      throw new ExtractionError("EXTRACTION_FAILED", "Article URL is required")
    }

    let response: Response
    try {
      response = await fetch(input.url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; CogniVaultBot/1.0; +https://cognivault.app)",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(15_000),
      })
    } catch (error) {
      throw new ExtractionError("TIMEOUT", "Failed to fetch article URL", {
        cause: error,
      })
    }

    if (!response.ok) {
      throw new ExtractionError(
        "EXTRACTION_FAILED",
        `Article fetch failed with HTTP ${response.status}`
      )
    }

    const html = await response.text()
    const dom = new JSDOM(html, { url: input.url })
    const reader = new Readability(dom.window.document)
    const article = reader.parse()

    const text = (article?.textContent ?? "").trim()
    if (!text) {
      throw new ExtractionError(
        "EXTRACTION_FAILED",
        "Could not extract readable text from article"
      )
    }

    const titleHint = article?.title?.trim()
    return {
      text,
      titleHint: titleHint && titleHint.length > 0 ? titleHint : undefined,
      language: detectLanguageHint(text),
      wordCount: wordCount(text),
    }
  },
}
