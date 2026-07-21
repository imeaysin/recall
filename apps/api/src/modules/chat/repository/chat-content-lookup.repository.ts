import { Injectable } from "@nestjs/common"
import { isValidObjectId, Types } from "mongoose"
import { ContentModel, type IContent } from "@workspace/db"
import type { ContentCitationMeta } from "../domain"

@Injectable()
export class ChatContentLookupRepository {
  async findCitationMetaByIds(input: {
    readonly userId: string
    readonly contentIds: readonly string[]
  }): Promise<ReadonlyMap<string, ContentCitationMeta>> {
    const ids = [...new Set(input.contentIds)].filter(isValidObjectId)
    if (ids.length === 0) return new Map()

    const objectIds = ids.map((id) => new Types.ObjectId(id))
    const docs = await ContentModel.find({
      userId: input.userId,
      _id: { $in: objectIds },
    })
      .select({
        title: 1,
        sourceUrl: 1,
        language: 1,
        isDeleted: 1,
      })
      .lean<
        Pick<
          IContent,
          "_id" | "title" | "sourceUrl" | "language" | "isDeleted"
        >[]
      >()

    const found = new Map(
      docs.map((doc) => [
        doc._id.toString(),
        {
          contentId: doc._id.toString(),
          title: doc.title,
          sourceUrl: doc.sourceUrl,
          language: doc.language,
          isDeleted: doc.isDeleted,
          missing: false,
        } satisfies ContentCitationMeta,
      ])
    )

    const entries: [string, ContentCitationMeta][] = ids.map((contentId) => {
      const meta = found.get(contentId)
      if (meta) return [contentId, meta]
      const missingMeta: ContentCitationMeta = {
        contentId,
        title: undefined,
        sourceUrl: undefined,
        language: undefined,
        isDeleted: true,
        missing: true,
      }
      return [contentId, missingMeta]
    })
    return new Map(entries)
  }
}
