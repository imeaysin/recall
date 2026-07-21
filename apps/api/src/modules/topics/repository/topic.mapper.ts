import type { ITopic } from "@workspace/db"
import type { TopicEntity } from "../domain"

export function mapTopicDoc(doc: ITopic): TopicEntity {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    name: doc.name,
    normalizedName: doc.normalizedName,
    contentCount: doc.contentCount,
    isUserCreated: doc.isUserCreated,
    color: doc.color,
    mergedIntoTopicId: doc.mergedIntoTopicId?.toString(),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}
