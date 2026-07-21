import { Injectable } from "@nestjs/common"
import { Types } from "mongoose"
import { TopicModel, type ITopic } from "@workspace/db"
import {
  ROOT_TOPIC_DISPLAY_NAME,
  ROOT_TOPIC_NORMALIZED_NAME,
} from "../domain/root"
import { topicColor } from "../domain/topic-name"
import type { TopicEntity } from "../domain"
import { mapTopicDoc } from "./topic.mapper"

export type RootLinkedTopic = {
  readonly topicId: Types.ObjectId
  readonly name: string
  readonly normalizedName: string
}

const MONGO_DUPLICATE_KEY = 11000

type MongoDuplicateError = {
  readonly code: number
}

function isMongoDuplicateKey(error: object): error is MongoDuplicateError {
  return "code" in error && error.code === MONGO_DUPLICATE_KEY
}

@Injectable()
export class TopicRootRepository {
  async ensureRootTopic(userId: string): Promise<TopicEntity> {
    try {
      const doc = await TopicModel.findOneAndUpdate(
        { userId, normalizedName: ROOT_TOPIC_NORMALIZED_NAME },
        {
          $setOnInsert: {
            name: ROOT_TOPIC_DISPLAY_NAME,
            normalizedName: ROOT_TOPIC_NORMALIZED_NAME,
            contentRefs: [],
            contentCount: 0,
            isUserCreated: true,
            color: topicColor(ROOT_TOPIC_NORMALIZED_NAME),
          },
        },
        { upsert: true, returnDocument: "after" }
      )
      if (!doc) return this.loadRootTopic(userId)
      return mapTopicDoc(doc)
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        isMongoDuplicateKey(error)
      ) {
        return this.loadRootTopic(userId)
      }
      throw error
    }
  }

  async linkContentToTopic(input: {
    readonly topic: TopicEntity
    readonly contentId: string
  }): Promise<RootLinkedTopic> {
    const contentObjectId = new Types.ObjectId(input.contentId)
    await TopicModel.updateOne(
      {
        _id: input.topic.id,
        contentRefs: { $ne: contentObjectId },
      },
      {
        $addToSet: { contentRefs: contentObjectId },
        $inc: { contentCount: 1 },
      }
    )
    return {
      topicId: new Types.ObjectId(input.topic.id),
      name: input.topic.name,
      normalizedName: input.topic.normalizedName,
    }
  }

  private async loadRootTopic(userId: string): Promise<TopicEntity> {
    const doc = await TopicModel.findOne({
      userId,
      normalizedName: ROOT_TOPIC_NORMALIZED_NAME,
    }).lean<ITopic>()
    if (!doc) {
      throw new Error("Root topic missing after upsert race")
    }
    return mapTopicDoc(doc)
  }
}
