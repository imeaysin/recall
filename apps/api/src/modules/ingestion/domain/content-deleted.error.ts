/** Thrown when content is soft-deleted while an ingestion step is in flight. */
export class ContentDeletedDuringIngestionError extends Error {
  readonly code = "CONTENT_DELETED"

  constructor(contentId: string) {
    super(`Content ${contentId} was deleted during ingestion`)
    this.name = "ContentDeletedDuringIngestionError"
  }
}
