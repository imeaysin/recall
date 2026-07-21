import { Injectable } from "@nestjs/common"
import { isValidObjectId, Types } from "mongoose"
import { ContentModel, TopicModel, type ITopic } from "@workspace/db"
import { computeIsOrphanFromTopicIds } from "../domain/is-orphan"
import type { TopicEntity } from "../domain"

@Injectable()
export class TopicContentRepository {
  async refreshAfterTopicRemoved(input: {
    readonly userId: string
    readonly contentId: string
    readonly removedTopicId: string
    readonly rootTopic: TopicEntity
  }): Promise<void> {
    if (!isValidObjectId(input.contentId)) return

    const contentObjectId = new Types.ObjectId(input.contentId)
    const removedObjectId = new Types.ObjectId(input.removedTopicId)
    const rootObjectId = new Types.ObjectId(input.rootTopic.id)

    const doc = await ContentModel.findOne({
      _id: contentObjectId,
      userId: input.userId,
      isDeleted: false,
    }).select({ topicRefs: 1 })

    if (!doc) return

    const remainingRefs = doc.topicRefs
      .filter((id: Types.ObjectId) => !id.equals(removedObjectId))
      .map((id: Types.ObjectId) => id.toString())

    const needsRoot = computeIsOrphanFromTopicIds({
      topicRefIds: remainingRefs,
      rootTopicId: input.rootTopic.id,
    })

    const hasRoot = remainingRefs.includes(input.rootTopic.id)
    const nextRefs =
      needsRoot && !hasRoot
        ? [...remainingRefs, input.rootTopic.id]
        : remainingRefs

    const nextRefObjectIds = nextRefs.map((id) => new Types.ObjectId(id))

    if (needsRoot && !hasRoot) {
      await TopicModel.updateOne(
        {
          _id: rootObjectId,
          contentRefs: { $ne: contentObjectId },
        },
        {
          $addToSet: { contentRefs: contentObjectId },
          $inc: { contentCount: 1 },
        }
      )
    }

    const topics = await TopicModel.find({
      userId: input.userId,
      _id: { $in: nextRefObjectIds },
    }).lean<ITopic[]>()

    const snapshot = topics.map((topic) => ({
      topicId: topic._id,
      name: topic.name,
    }))

    await ContentModel.updateOne(
      { _id: contentObjectId, userId: input.userId, isDeleted: false },
      {
        $set: {
          topicRefs: nextRefObjectIds,
          topicSnapshot: snapshot,
          isOrphan: needsRoot,
        },
      }
    )
  }

  async replaceTopicOnContents(input: {
    readonly userId: string
    readonly sourceTopicId: string
    readonly targetTopic: TopicEntity
    readonly rootTopicId: string
  }): Promise<void> {
    const sourceObjectId = new Types.ObjectId(input.sourceTopicId)
    const targetObjectId = new Types.ObjectId(input.targetTopic.id)

    const contents = await ContentModel.find({
      userId: input.userId,
      isDeleted: false,
      topicRefs: sourceObjectId,
    }).select({ topicRefs: 1, topicSnapshot: 1 })

    for (const content of contents) {
      const withoutSource = content.topicRefs.filter(
        (id: Types.ObjectId) => !id.equals(sourceObjectId)
      )
      const hasTarget = withoutSource.some((id: Types.ObjectId) =>
        id.equals(targetObjectId)
      )
      const nextRefs = hasTarget
        ? withoutSource
        : [...withoutSource, targetObjectId]

      const snapshotWithoutSource = content.topicSnapshot.filter(
        (entry: { topicId: Types.ObjectId; name: string }) =>
          !entry.topicId.equals(sourceObjectId)
      )
      const hasTargetSnapshot = snapshotWithoutSource.some(
        (entry: { topicId: Types.ObjectId; name: string }) =>
          entry.topicId.equals(targetObjectId)
      )
      const nextSnapshot = hasTargetSnapshot
        ? snapshotWithoutSource
        : [
            ...snapshotWithoutSource,
            {
              topicId: targetObjectId,
              name: input.targetTopic.name,
            },
          ]

      const isOrphan = computeIsOrphanFromTopicIds({
        topicRefIds: nextRefs.map((id: Types.ObjectId) => id.toString()),
        rootTopicId: input.rootTopicId,
      })

      await ContentModel.updateOne(
        { _id: content._id },
        {
          $set: {
            topicRefs: nextRefs,
            topicSnapshot: nextSnapshot,
            isOrphan,
          },
        }
      )
    }
  }

  async updateSnapshotName(input: {
    readonly userId: string
    readonly topicId: string
    readonly name: string
  }): Promise<void> {
    const topicObjectId = new Types.ObjectId(input.topicId)
    await ContentModel.updateMany(
      {
        userId: input.userId,
        isDeleted: false,
        topicRefs: topicObjectId,
      },
      {
        $set: { "topicSnapshot.$[entry].name": input.name },
      },
      {
        arrayFilters: [{ "entry.topicId": topicObjectId }],
      }
    )
  }
}
