import { Injectable } from "@nestjs/common"
import { isValidObjectId, Types } from "mongoose"
import {
  ChatMessageModel,
  ChatModel,
  ContentModel,
  ContentTrashModel,
  IngestionJobModel,
  TopicModel,
  VectorChunkModel,
  type IContent,
  type IContentTrash,
} from "@workspace/db"
import { ingestionEnv } from "@workspace/config/ingestion"
import type { ContentTrashItem } from "@workspace/contracts"
import type { ContentEntity } from "../domain"
import { mapContentDoc } from "./content.mapper"
import { parseTrashSnapshot } from "./content-lifecycle-trash-parse"

@Injectable()
export class ContentLifecycleRepository {
  async softDelete(userId: string, contentId: string): Promise<boolean> {
    if (!isValidObjectId(contentId)) return false

    const doc = await ContentModel.findOne({
      _id: contentId,
      userId,
      isDeleted: false,
    }).lean<IContent>()
    if (!doc) return false

    const now = new Date()
    const retentionMs =
      ingestionEnv.CONTENT_TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000

    await ContentTrashModel.create({
      originalContentId: doc._id,
      userId,
      snapshot: {
        id: doc._id.toString(),
        userId: doc.userId,
        sourceType: doc.sourceType,
        sourceUrl: doc.sourceUrl,
        normalizedUrl: doc.normalizedUrl,
        title: doc.title,
        summary: doc.summary,
        status: doc.status,
        libraryStatus: doc.libraryStatus,
        topicSnapshot: doc.topicSnapshot.map((topic) => ({
          topicId: topic.topicId.toString(),
          name: topic.name,
        })),
        topicRefs: doc.topicRefs.map((id) => id.toString()),
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      },
      deletedAt: now,
      purgeAt: new Date(now.getTime() + retentionMs),
    })

    const result = await ContentModel.updateOne(
      { _id: contentId, userId, isDeleted: false },
      {
        $set: { isDeleted: true, deletedAt: now },
        $unset: { lockedAt: "", lockedBy: "" },
      }
    )
    if (result.modifiedCount === 0) return false

    const contentObjectId = new Types.ObjectId(contentId)
    await TopicModel.updateMany(
      { userId, contentRefs: contentObjectId },
      {
        $pull: { contentRefs: contentObjectId },
        $inc: { contentCount: -1 },
      }
    )

    return true
  }

  async listTrash(userId: string): Promise<readonly ContentTrashItem[]> {
    const rows = await ContentTrashModel.find({ userId })
      .sort({ deletedAt: -1 })
      .limit(100)
      .lean<IContentTrash[]>()

    return rows.map((row) => {
      const snapshot = parseTrashSnapshot(row.snapshot)
      return {
        id: row._id.toString(),
        originalContentId: row.originalContentId.toString(),
        title: snapshot.title,
        sourceType: snapshot.sourceType,
        deletedAt: row.deletedAt.toISOString(),
        purgeAt: row.purgeAt.toISOString(),
      }
    })
  }

  async restoreFromTrash(input: {
    readonly userId: string
    readonly trashId: string
  }): Promise<ContentEntity | null> {
    if (!isValidObjectId(input.trashId)) return null

    const trash = await ContentTrashModel.findOne({
      _id: input.trashId,
      userId: input.userId,
    }).lean<IContentTrash>()
    if (!trash) return null

    const doc = await ContentModel.findOneAndUpdate(
      {
        _id: trash.originalContentId,
        userId: input.userId,
        isDeleted: true,
      },
      {
        $set: { isDeleted: false },
        $unset: { deletedAt: "" },
      },
      { returnDocument: "after" }
    )
    if (!doc) return null

    const snapshot = parseTrashSnapshot(trash.snapshot)
    const contentObjectId = trash.originalContentId

    for (const topic of snapshot.topicSnapshot) {
      if (!isValidObjectId(topic.topicId)) continue
      const linked = await TopicModel.updateOne(
        {
          _id: topic.topicId,
          userId: input.userId,
          contentRefs: { $ne: contentObjectId },
          mergedIntoTopicId: { $exists: false },
        },
        {
          $addToSet: { contentRefs: contentObjectId },
          $inc: { contentCount: 1 },
        }
      )
      if (linked.matchedCount > 0) continue

      const normalizedName = topic.name
        .toLowerCase()
        .trim()
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .replace(/\s+/g, " ")
      if (!normalizedName) continue

      await TopicModel.findOneAndUpdate(
        { userId: input.userId, normalizedName },
        {
          $setOnInsert: {
            name: topic.name,
            normalizedName,
            contentRefs: [],
            contentCount: 0,
            isUserCreated: true,
          },
        },
        { upsert: true }
      )
      await TopicModel.updateOne(
        {
          userId: input.userId,
          normalizedName,
          contentRefs: { $ne: contentObjectId },
        },
        {
          $addToSet: { contentRefs: contentObjectId },
          $inc: { contentCount: 1 },
        }
      )
    }

    await ContentTrashModel.deleteOne({ _id: trash._id })
    return mapContentDoc(doc)
  }

  async permanentDelete(input: {
    readonly userId: string
    readonly contentId: string
  }): Promise<boolean> {
    if (!isValidObjectId(input.contentId)) return false

    const contentObjectId = new Types.ObjectId(input.contentId)
    const doc = await ContentModel.findOne({
      _id: contentObjectId,
      userId: input.userId,
    }).lean<IContent>()
    if (!doc) return false

    await VectorChunkModel.deleteMany({ contentId: contentObjectId })
    await TopicModel.updateMany(
      { userId: input.userId, contentRefs: contentObjectId },
      {
        $pull: { contentRefs: contentObjectId },
        $inc: { contentCount: -1 },
      }
    )
    await ContentTrashModel.deleteMany({ originalContentId: contentObjectId })
    await ContentModel.deleteOne({
      _id: contentObjectId,
      userId: input.userId,
    })
    return true
  }

  async purgeExpiredSoftDeleted(limit = 50): Promise<number> {
    const cutoff = new Date(
      Date.now() -
        ingestionEnv.CONTENT_TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000
    )
    const expired = await ContentModel.find({
      isDeleted: true,
      deletedAt: { $lt: cutoff },
    })
      .select({ _id: 1 })
      .limit(limit)
      .lean<{ _id: Types.ObjectId }[]>()

    for (const doc of expired) {
      await VectorChunkModel.deleteMany({ contentId: doc._id })
      await ContentTrashModel.deleteMany({ originalContentId: doc._id })
      await ContentModel.deleteOne({ _id: doc._id })
    }

    return expired.length
  }

  async purgeAllForUser(userId: string): Promise<void> {
    await VectorChunkModel.deleteMany({ userId })
    await IngestionJobModel.deleteMany({ userId })
    await ContentTrashModel.deleteMany({ userId })
    await TopicModel.deleteMany({ userId })
    await ChatMessageModel.deleteMany({ userId })
    await ChatModel.deleteMany({ userId })
    await ContentModel.deleteMany({ userId })
  }
}
