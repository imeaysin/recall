export const INGESTION_CLAIM_STATUSES = ["PENDING", "DEFERRED"] as const

export const INGESTION_ACTIVE_STATUSES = [
  "EXTRACTING",
  "METADATA",
  "GRAPH",
  "EMBEDDING",
] as const

export const EXTRACTION_ERROR_CODES = [
  "EXTRACTION_FAILED",
  "UNSUPPORTED_FORMAT",
  "FILE_TOO_LARGE",
  "TIMEOUT",
] as const

/** Failures that should not be retried (site blocks, bad input, etc.). */
export const NON_RETRYABLE_ERROR_CODES = [
  "EXTRACTION_FAILED",
  "UNSUPPORTED_FORMAT",
  "FILE_TOO_LARGE",
] as const

export type ExtractionErrorCode = (typeof EXTRACTION_ERROR_CODES)[number]

export type NonRetryableErrorCode = (typeof NON_RETRYABLE_ERROR_CODES)[number]

export function isExtractionErrorCode(
  code: string
): code is ExtractionErrorCode {
  return EXTRACTION_ERROR_CODES.some((value) => value === code)
}

export function isNonRetryableErrorCode(
  code: string
): code is NonRetryableErrorCode {
  return NON_RETRYABLE_ERROR_CODES.some((value) => value === code)
}

export function isActiveIngestionStatus(
  status: string
): status is (typeof INGESTION_ACTIVE_STATUSES)[number] {
  return INGESTION_ACTIVE_STATUSES.some((value) => value === status)
}
