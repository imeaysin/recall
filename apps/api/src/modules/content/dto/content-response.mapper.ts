import type { ContentResponse } from "@workspace/contracts"
import type { ContentEntity } from "../domain"

export function toContentResponse(entity: ContentEntity): ContentResponse {
  return {
    id: entity.id,
    userId: entity.userId,
    sourceType: entity.sourceType,
    sourceUrl: entity.sourceUrl,
    normalizedUrl: entity.normalizedUrl,
    title: entity.title,
    summary: entity.summary,
    titleEditedByUser: entity.titleEditedByUser,
    summaryEditedByUser: entity.summaryEditedByUser,
    wordCount: entity.wordCount,
    language: entity.language,
    topicSnapshot: [...entity.topicSnapshot],
    isOrphan: entity.isOrphan,
    status: entity.status,
    processingStep: entity.processingStep,
    retryCount: entity.retryCount,
    errorMessage: entity.errorMessage,
    errorCode: entity.errorCode,
    libraryStatus: entity.libraryStatus,
    possibleDuplicateOfContentId: entity.possibleDuplicateOfContentId,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  }
}
