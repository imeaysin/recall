import { Injectable } from "@nestjs/common"
import { Types } from "mongoose"
import { TopicModel, type ITopic } from "@workspace/db"
import { normalizeTopicName, topicColor } from "../domain/topic-name"
import type { RootLinkedTopic } from "./topic-root.repository"

const MONGO_DUPLICATE_KEY = 11000

type MongoDuplicateError = {
  readonly code: number
}

function isMongoDuplicateKey(error: object): error is MongoDuplicateError {
  return "code" in error && error.code === MONGO_DUPLICATE_KEY
}

@Injectable()
export class TopicIngestionRepository {
  async upsertTopicsForContent(input: {
    readonly userId: string
    readonly contentId: string
    readonly topicNames: readonly string[]
  }): Promise<readonly RootLinkedTopic[]> {
    const results = await Promise.all(
      input.topicNames.slice(0, 5).map((rawTopic) =>
        this.upsertSingleTopic({
          userId: input.userId,
          contentId: input.contentId,
          rawTopic,
        })
      )
    )

    return results.filter((topic): topic is RootLinkedTopic => topic !== null)
  }

  private async upsertSingleTopic(input: {
    readonly userId: string
    readonly contentId: string
    readonly rawTopic: string
  }): Promise<RootLinkedTopic | null> {
    const normalizedName = normalizeTopicName(input.rawTopic)
    if (!normalizedName) return null

    try {
      const topic = await TopicModel.findOneAndUpdate(
        { userId: input.userId, normalizedName },
        {
          $setOnInsert: {
            name: input.rawTopic.trim(),
            normalizedName,
            contentRefs: [],
            contentCount: 0,
            isUserCreated: false,
            color: topicColor(normalizedName),
          },
        },
        { upsert: true, returnDocument: "after" }
      )
      if (!topic) return this.findAndLinkTopic(input, normalizedName)
      return this.linkContentToTopic(topic, input.contentId)
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        isMongoDuplicateKey(error)
      ) {
        return this.findAndLinkTopic(input, normalizedName)
      }
      throw error
    }
  }

  private async findAndLinkTopic(
    input: {
      readonly userId: string
      readonly contentId: string
    },
    normalizedName: string
  ): Promise<RootLinkedTopic | null> {
    const topic = await TopicModel.findOne({
      userId: input.userId,
      normalizedName,
    })
    if (!topic) return null
    return this.linkContentToTopic(topic, input.contentId)
  }

  private async linkContentToTopic(
    topic: ITopic,
    contentId: string
  ): Promise<RootLinkedTopic> {
    const contentObjectId = new Types.ObjectId(contentId)
    await TopicModel.updateOne(
      { _id: topic._id, contentRefs: { $ne: contentObjectId } },
      {
        $addToSet: { contentRefs: contentObjectId },
        $inc: { contentCount: 1 },
      }
    )
    return {
      topicId: topic._id,
      name: topic.name,
      normalizedName: topic.normalizedName,
    }
  }
}
