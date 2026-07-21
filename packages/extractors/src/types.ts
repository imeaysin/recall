export type SourceType = "ARTICLE" | "YOUTUBE" | "PDF" | "IMAGE"

export type ExtractInput = {
  readonly sourceType: SourceType
  readonly url?: string
  readonly buffer?: Buffer
  readonly mimeType?: string
  readonly originalName?: string
}

export type ExtractResult = {
  readonly text: string
  readonly titleHint?: string
  readonly language?: string
  readonly wordCount: number
}

export type ExtractionErrorCode =
  "EXTRACTION_FAILED" | "UNSUPPORTED_FORMAT" | "FILE_TOO_LARGE" | "TIMEOUT"

export class ExtractionError extends Error {
  readonly code: ExtractionErrorCode

  constructor(
    code: ExtractionErrorCode,
    message: string,
    options?: ErrorOptions
  ) {
    super(message, options)
    this.name = "ExtractionError"
    this.code = code
  }
}

export type ContentExtractor = {
  readonly sourceType: SourceType
  extract(input: ExtractInput): Promise<ExtractResult>
}
