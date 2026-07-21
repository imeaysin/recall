import { Injectable } from "@nestjs/common"
import { isValidObjectId, Types } from "mongoose"
import {
  ContentModel,
  TopicModel,
  VectorChunkModel,
  type ITopic,
} from "@workspace/db"
import { computeIsOrphanFromNormalizedNames } from "@/modules/topics/domain/is-orphan"
import type { ContentEntity } from "../domain"
import { mapContentDoc } from "./content.mapper"

type ApplyAiMetadataInput = {
  readonly contentId: string
  readonly title?: string
  readonly summary?: string
  readonly language?: string
}

type ReplaceTopicLinksInput = {
  readonly userId: string
  readonly contentId: string
  readonly topicIds: readonly string[]
}

@Injectable()
export class ContentProcessingRepository {
  async applyAiMetadata(
    input: ApplyAiMetadataInput
  ): Promise<ContentEntity | null> {
    if (!isValidObjectId(input.contentId)) return null

    const current = await ContentModel.findOne({
      _id: input.contentId,
      isDeleted: false,
    }).select({
      titleEditedByUser: 1,
      summaryEditedByUser: 1,
    })

    if (!current) return null

    const doc = await ContentModel.findOneAndUpdate(
      { _id: input.contentId, isDeleted: false },
      {
        $set: {
          status: "GRAPH",
          processingStep: "GRAPH",
          ...(input.language ? { language: input.language } : {}),
          ...(!current.titleEditedByUser && input.title
            ? { title: input.title }
            : {}),
          ...(!current.summaryEditedByUser && input.summary
            ? { summary: input.summary }
            : {}),
        },
      },
      { returnDocument: "after" }
    )
    return doc ? mapContentDoc(doc) : null
  }

  async replaceTopicLinks(
    input: ReplaceTopicLinksInput
  ): Promise<ContentEntity | null> {
    if (!isValidObjectId(input.contentId)) return null

    const validIds = input.topicIds.filter((id) => isValidObjectId(id))
    const topics = await TopicModel.find({
      userId: input.userId,
      _id: { $in: validIds.map((id) => new Types.ObjectId(id)) },
      mergedIntoTopicId: { $exists: false },
    }).lean<ITopic[]>()

    const contentObjectId = new Types.ObjectId(input.contentId)
    const previous = await ContentModel.findOne({
      _id: input.contentId,
      userId: input.userId,
      isDeleted: false,
    }).select({ topicRefs: 1 })

    if (!previous) return null

    const previousIds = previous.topicRefs.map((id) => id.toString())
    const nextIds = topics.map((topic) => topic._id.toString())

    await TopicModel.updateMany(
      {
        userId: input.userId,
        _id: {
          $in: previousIds
            .filter((id) => !nextIds.includes(id))
            .map((id) => new Types.ObjectId(id)),
        },
      },
      {
        $pull: { contentRefs: contentObjectId },
        $inc: { contentCount: -1 },
      }
    )

    await TopicModel.updateMany(
      {
        userId: input.userId,
        _id: {
          $in: nextIds
            .filter((id) => !previousIds.includes(id))
            .map((id) => new Types.ObjectId(id)),
        },
        contentRefs: { $ne: contentObjectId },
      },
      {
        $addToSet: { contentRefs: contentObjectId },
        $inc: { contentCount: 1 },
      }
    )

    const doc = await ContentModel.findOneAndUpdate(
      {
        _id: input.contentId,
        userId: input.userId,
        isDeleted: false,
      },
      {
        $set: {
          topicRefs: topics.map((topic) => topic._id),
          topicSnapshot: topics.map((topic) => ({
            topicId: topic._id,
            name: topic.name,
          })),
          isOrphan: computeIsOrphanFromNormalizedNames(
            topics.map((topic) => topic.normalizedName)
          ),
        },
      },
      { returnDocument: "after" }
    )
    return doc ? mapContentDoc(doc) : null
  }

  async resetForRegenerate(input: {
    readonly userId: string
    readonly contentId: string
  }): Promise<ContentEntity | null> {
    if (!isValidObjectId(input.contentId)) return null

    const doc = await ContentModel.findOneAndUpdate(
      {
        _id: input.contentId,
        userId: input.userId,
        isDeleted: false,
        status: { $in: ["COMPLETED", "FAILED", "DEFERRED"] },
      },
      {
        $set: {
          status: "PENDING",
          retryCount: 0,
          titleEditedByUser: false,
          summaryEditedByUser: false,
        },
        $unset: {
          errorMessage: "",
          errorCode: "",
          lockedAt: "",
          lockedBy: "",
          processingStep: "",
        },
      },
      { returnDocument: "after" }
    )
    return doc ? mapContentDoc(doc) : null
  }

  async clearDerivedDataForRetry(contentId: string): Promise<void> {
    if (!isValidObjectId(contentId)) return
    await VectorChunkModel.deleteMany({
      contentId: new Types.ObjectId(contentId),
    })
  }

  async resetFailedForRetry(input: {
    readonly userId: string
    readonly contentId: string
  }): Promise<ContentEntity | null> {
    if (!isValidObjectId(input.contentId)) return null

    await this.clearDerivedDataForRetry(input.contentId)

    const doc = await ContentModel.findOneAndUpdate(
      {
        _id: input.contentId,
        userId: input.userId,
        isDeleted: false,
        status: "FAILED",
      },
      {
        $set: {
          status: "PENDING",
          retryCount: 0,
          isOrphan: true,
          topicRefs: [],
          topicSnapshot: [],
        },
        $unset: {
          errorMessage: "",
          errorCode: "",
          lockedAt: "",
          lockedBy: "",
          processingStep: "",
          contentHash: "",
          possibleDuplicateOfContentId: "",
        },
      },
      { returnDocument: "after" }
    )
    return doc ? mapContentDoc(doc) : null
  }
}
