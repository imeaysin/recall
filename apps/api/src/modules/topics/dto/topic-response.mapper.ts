import type { TopicResponse } from "@workspace/contracts"
import type { TopicEntity } from "../domain"
import { isRootNormalizedName } from "../domain/root"

export function toTopicResponse(entity: TopicEntity): TopicResponse {
  return {
    id: entity.id,
    userId: entity.userId,
    name: entity.name,
    normalizedName: entity.normalizedName,
    contentCount: entity.contentCount,
    isUserCreated: entity.isUserCreated,
    isRoot: isRootNormalizedName(entity.normalizedName),
    color: entity.color,
    mergedIntoTopicId: entity.mergedIntoTopicId,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  }
}
