import type { ContentResponse } from "@workspace/contracts"

const CONTENT_ERROR_LABELS: Record<
  NonNullable<ContentResponse["errorCode"]>,
  string
> = {
  EXTRACTION_FAILED:
    "We could not extract text from this source. Try another URL or upload a PDF.",
  AI_QUOTA_EXCEEDED:
    "Daily AI processing limit reached. Retry tomorrow or contact support.",
  AI_ERROR: "AI processing failed. You can retry ingestion.",
  UNSUPPORTED_FORMAT: "This file or URL format is not supported.",
  FILE_TOO_LARGE: "File exceeds the maximum upload size (15 MB).",
  TIMEOUT: "Processing timed out. Try again with Retry.",
}

export function contentErrorLabel(
  errorCode: ContentResponse["errorCode"]
): string | undefined {
  if (!errorCode) return undefined
  return CONTENT_ERROR_LABELS[errorCode] ?? errorCode
}
