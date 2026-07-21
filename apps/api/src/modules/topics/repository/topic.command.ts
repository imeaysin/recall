import { Injectable } from "@nestjs/common"
import { isValidObjectId, Types } from "mongoose"
import { TopicModel, type ITopic } from "@workspace/db"
import type { TopicEntity } from "../domain"
import { isRootNormalizedName } from "../domain/root"
import { normalizeTopicName, topicColor } from "../domain/topic-name"
import { TopicMergeInvalidException } from "../domain/exceptions"
import { mapTopicDoc } from "./topic.mapper"
import { TopicContentRepository } from "./topic-content.repository"
import { TopicRootRepository } from "./topic-root.repository"

@Injectable()
export class TopicCommandRepository {
  constructor(
    private readonly contentRepo: TopicContentRepository,
    private readonly rootRepo: TopicRootRepository
  ) {}

  async createUserTopic(input: {
    readonly userId: string
    readonly name: string
  }): Promise<TopicEntity> {
    const normalizedName = normalizeTopicName(input.name)
    if (!normalizedName || isRootNormalizedName(normalizedName)) {
      throw new TopicMergeInvalidException("Invalid topic name")
    }

    const existing = await TopicModel.findOne({
      userId: input.userId,
      normalizedName,
      mergedIntoTopicId: { $exists: false },
    }).lean<ITopic>()
    if (existing) {
      throw new TopicMergeInvalidException(
        "A topic with this name already exists"
      )
    }

    const doc = await TopicModel.create({
      userId: input.userId,
      name: input.name.trim(),
      normalizedName,
      contentRefs: [],
      contentCount: 0,
      isUserCreated: true,
      color: topicColor(normalizedName),
    })

    return mapTopicDoc(doc)
  }

  async renameUserTopic(input: {
    readonly userId: string
    readonly topicId: string
    readonly name: string
  }): Promise<TopicEntity | null> {
    if (!isValidObjectId(input.topicId)) return null

    const current = await TopicModel.findOne({
      _id: input.topicId,
      userId: input.userId,
      mergedIntoTopicId: { $exists: false },
    }).lean<ITopic>()
    if (!current) return null
    if (isRootNormalizedName(current.normalizedName)) return null

    const normalizedName = normalizeTopicName(input.name)
    if (!normalizedName || isRootNormalizedName(normalizedName)) {
      throw new TopicMergeInvalidException("Invalid topic name")
    }

    const duplicate = await TopicModel.findOne({
      userId: input.userId,
      normalizedName,
      _id: { $ne: input.topicId },
      mergedIntoTopicId: { $exists: false },
    }).lean<ITopic>()
    if (duplicate) {
      throw new TopicMergeInvalidException(
        "A topic with this name already exists"
      )
    }

    const doc = await TopicModel.findOneAndUpdate(
      { _id: input.topicId, userId: input.userId },
      {
        $set: {
          name: input.name.trim(),
          normalizedName,
          isUserCreated: true,
        },
      },
      { returnDocument: "after" }
    )
    if (!doc) return null

    await this.contentRepo.updateSnapshotName({
      userId: input.userId,
      topicId: input.topicId,
      name: doc.name,
    })

    return mapTopicDoc(doc)
  }

  async deleteUserTopic(input: {
    readonly userId: string
    readonly topicId: string
  }): Promise<boolean> {
    if (!isValidObjectId(input.topicId)) return false

    const topic = await TopicModel.findOne({
      _id: input.topicId,
      userId: input.userId,
    }).lean<ITopic>()
    if (!topic) return false

    const root = await this.rootRepo.ensureRootTopic(input.userId)
    const contentIds = topic.contentRefs.map((id: Types.ObjectId) =>
      id.toString()
    )

    for (const contentId of contentIds) {
      await this.contentRepo.refreshAfterTopicRemoved({
        userId: input.userId,
        contentId,
        removedTopicId: input.topicId,
        rootTopic: root,
      })
    }

    const result = await TopicModel.deleteOne({
      _id: input.topicId,
      userId: input.userId,
    })
    return result.deletedCount > 0
  }

  async mergeTopics(input: {
    readonly userId: string
    readonly sourceTopicId: string
    readonly intoTopicId: string
  }): Promise<TopicEntity | null> {
    if (
      !isValidObjectId(input.sourceTopicId) ||
      !isValidObjectId(input.intoTopicId)
    ) {
      return null
    }
    if (input.sourceTopicId === input.intoTopicId) {
      throw new TopicMergeInvalidException("Cannot merge a topic into itself")
    }

    const source = await TopicModel.findOne({
      _id: input.sourceTopicId,
      userId: input.userId,
      mergedIntoTopicId: { $exists: false },
    }).lean<ITopic>()
    const target = await TopicModel.findOne({
      _id: input.intoTopicId,
      userId: input.userId,
      mergedIntoTopicId: { $exists: false },
    }).lean<ITopic>()

    if (!source || !target) return null
    if (
      isRootNormalizedName(source.normalizedName) ||
      isRootNormalizedName(target.normalizedName)
    ) {
      throw new TopicMergeInvalidException("Cannot merge library root topics")
    }

    const root = await this.rootRepo.ensureRootTopic(input.userId)
    const targetEntity = mapTopicDoc(target)
    await this.contentRepo.replaceTopicOnContents({
      userId: input.userId,
      sourceTopicId: input.sourceTopicId,
      targetTopic: targetEntity,
      rootTopicId: root.id,
    })

    const sourceObjectId = new Types.ObjectId(input.sourceTopicId)
    const targetObjectId = new Types.ObjectId(input.intoTopicId)
    const targetRefSet = new Set(
      target.contentRefs.map((id: Types.ObjectId) => id.toString())
    )
    const refsToMigrate = source.contentRefs.filter(
      (id: Types.ObjectId) => !targetRefSet.has(id.toString())
    )

    await TopicModel.updateOne(
      { _id: targetObjectId },
      {
        $addToSet: { contentRefs: { $each: refsToMigrate } },
        $inc: { contentCount: refsToMigrate.length },
      }
    )

    await TopicModel.updateOne(
      { _id: sourceObjectId },
      {
        $set: {
          mergedIntoTopicId: targetObjectId,
          contentRefs: [],
          contentCount: 0,
        },
      }
    )

    const updatedTarget =
      await TopicModel.findById(targetObjectId).lean<ITopic>()
    return updatedTarget ? mapTopicDoc(updatedTarget) : null
  }
}
