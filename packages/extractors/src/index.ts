import type {
  ContentExtractor,
  ExtractInput,
  ExtractResult,
  SourceType,
} from "./types"
import { ExtractionError } from "./types"
import { articleExtractor } from "./article.extractor"
import { youtubeExtractor } from "./youtube.extractor"
import { pdfExtractor } from "./pdf.extractor"
import { imageExtractor } from "./image.extractor"
import { detectYoutubeVideoId } from "./normalize-url"

const extractors: Record<SourceType, ContentExtractor> = {
  ARTICLE: articleExtractor,
  YOUTUBE: youtubeExtractor,
  PDF: pdfExtractor,
  IMAGE: imageExtractor,
}

export function resolveSourceType(input: {
  url?: string
  mimeType?: string
  originalName?: string
}): SourceType {
  if (input.url && detectYoutubeVideoId(input.url)) return "YOUTUBE"
  if (input.url) return "ARTICLE"

  const mime = input.mimeType ?? ""
  const name = input.originalName?.toLowerCase() ?? ""
  if (
    mime === "application/pdf" ||
    name.endsWith(".pdf") ||
    name.endsWith(".epub")
  ) {
    return "PDF"
  }
  if (mime.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(name)) {
    return "IMAGE"
  }
  throw new ExtractionError(
    "UNSUPPORTED_FORMAT",
    "Could not determine content source type"
  )
}

export async function extractContent(
  input: ExtractInput
): Promise<ExtractResult> {
  const extractor = extractors[input.sourceType]
  if (!extractor) {
    throw new ExtractionError(
      "UNSUPPORTED_FORMAT",
      `No extractor for source type ${input.sourceType}`
    )
  }
  return extractor.extract(input)
}

export * from "./types"
export * from "./normalize-url"
export * from "./detect-language"
export { articleExtractor, youtubeExtractor, pdfExtractor, imageExtractor }
