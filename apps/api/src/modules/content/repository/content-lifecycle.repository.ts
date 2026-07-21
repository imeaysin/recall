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
} from "@workspace/db"
import { ingestionEnv } from "@workspace/config/ingestion"

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
