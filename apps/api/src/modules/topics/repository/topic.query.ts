import { Injectable } from "@nestjs/common"
import { isValidObjectId, Types } from "mongoose"
import { TopicModel, type ITopic } from "@workspace/db"
import type { TopicListQuery } from "@workspace/contracts"
import type { TopicEntity } from "../domain"
import {
  ROOT_TOPIC_NORMALIZED_NAME,
  isRootNormalizedName,
} from "../domain/root"
import { mapTopicDoc } from "./topic.mapper"

@Injectable()
export class TopicQueryRepository {
  async listForUser(
    userId: string,
    query: TopicListQuery = {}
  ): Promise<TopicEntity[]> {
    const filter: Record<string, object | string | boolean> = { userId }

    if (!query.includeMerged) {
      filter.mergedIntoTopicId = { $exists: false }
    }
    if (!query.includeRoot) {
      filter.normalizedName = { $ne: ROOT_TOPIC_NORMALIZED_NAME }
    }

    const docs = await TopicModel.find(filter)
      .sort({ contentCount: -1, name: 1 })
      .lean<ITopic[]>()

    return docs.map(mapTopicDoc)
  }

  async findByIdForUser(input: {
    readonly userId: string
    readonly topicId: string
  }): Promise<TopicEntity | null> {
    if (!isValidObjectId(input.topicId)) return null

    const doc = await TopicModel.findOne({
      _id: input.topicId,
      userId: input.userId,
    }).lean<ITopic>()

    return doc ? mapTopicDoc(doc) : null
  }

  async findActiveByNormalizedName(input: {
    readonly userId: string
    readonly normalizedName: string
  }): Promise<TopicEntity | null> {
    const doc = await TopicModel.findOne({
      userId: input.userId,
      normalizedName: input.normalizedName,
      mergedIntoTopicId: { $exists: false },
    }).lean<ITopic>()

    return doc ? mapTopicDoc(doc) : null
  }

  isRootEntity(entity: TopicEntity): boolean {
    return isRootNormalizedName(entity.normalizedName)
  }
}
