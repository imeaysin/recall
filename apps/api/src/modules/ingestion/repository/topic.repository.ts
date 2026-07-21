import { Types } from "mongoose"
import { TopicModel, type ITopic } from "@workspace/db"
import { normalizeTopicName, topicColor } from "../domain"

export type LinkedTopic = {
  readonly topicId: Types.ObjectId
  readonly name: string
}

const MONGO_DUPLICATE_KEY = 11000

type MongoDuplicateError = {
  readonly code: number
}

function isMongoDuplicateKey(error: object): error is MongoDuplicateError {
  return "code" in error && error.code === MONGO_DUPLICATE_KEY
}

export async function upsertTopicsForContent(input: {
  readonly userId: string
  readonly contentId: string
  readonly topicNames: readonly string[]
}): Promise<readonly LinkedTopic[]> {
  const results = await Promise.all(
    input.topicNames.slice(0, 5).map((rawTopic) =>
      upsertSingleTopic({
        userId: input.userId,
        contentId: input.contentId,
        rawTopic,
      })
    )
  )

  return results.filter((topic): topic is LinkedTopic => topic !== null)
}

async function upsertSingleTopic(input: {
  readonly userId: string
  readonly contentId: string
  readonly rawTopic: string
}): Promise<LinkedTopic | null> {
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
    if (!topic) return findAndLinkTopic(input, normalizedName)
    return linkContentToTopic(topic, input.contentId)
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      isMongoDuplicateKey(error)
    ) {
      return findAndLinkTopic(input, normalizedName)
    }
    throw error
  }
}

async function findAndLinkTopic(
  input: {
    readonly userId: string
    readonly contentId: string
  },
  normalizedName: string
): Promise<LinkedTopic | null> {
  const topic = await TopicModel.findOne({
    userId: input.userId,
    normalizedName,
  })
  if (!topic) return null
  return linkContentToTopic(topic, input.contentId)
}

async function linkContentToTopic(
  topic: ITopic,
  contentId: string
): Promise<LinkedTopic> {
  const contentObjectId = new Types.ObjectId(contentId)
  await TopicModel.updateOne(
    { _id: topic._id, contentRefs: { $ne: contentObjectId } },
    {
      $addToSet: { contentRefs: contentObjectId },
      $inc: { contentCount: 1 },
    }
  )
  return { topicId: topic._id, name: topic.name }
}
