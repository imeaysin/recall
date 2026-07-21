import type { Types } from "mongoose"
import type { IContent } from "@workspace/db"
import type { ContentEntity } from "../domain"

type ContentDocument = IContent | (IContent & { readonly _id: Types.ObjectId })

export function mapContentDoc(doc: ContentDocument): ContentEntity {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    sourceType: doc.sourceType,
    sourceUrl: doc.sourceUrl,
    normalizedUrl: doc.normalizedUrl,
    contentHash: doc.contentHash,
    possibleDuplicateOfContentId: doc.possibleDuplicateOfContentId?.toString(),
    title: doc.title,
    titleEditedByUser: doc.titleEditedByUser,
    summary: doc.summary,
    summaryEditedByUser: doc.summaryEditedByUser,
    wordCount: doc.wordCount,
    language: doc.language,
    topicRefs: doc.topicRefs.map((id) => id.toString()),
    topicSnapshot: doc.topicSnapshot.map((topic) => ({
      topicId: topic.topicId.toString(),
      name: topic.name,
    })),
    isOrphan: doc.isOrphan,
    status: doc.status,
    processingStep: doc.processingStep,
    retryCount: doc.retryCount,
    lockedAt: doc.lockedAt,
    lockedBy: doc.lockedBy,
    errorMessage: doc.errorMessage,
    errorCode: doc.errorCode,
    libraryStatus: doc.libraryStatus,
    isDeleted: doc.isDeleted,
    deletedAt: doc.deletedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}
