import { Injectable } from "@nestjs/common"
import { isValidObjectId, Types } from "mongoose"
import {
  ContentModel,
  type ContentStatus,
  type IContent,
  type LibraryStatus,
} from "@workspace/db"
import type { ContentListQuery } from "@workspace/contracts"
import type { ContentEntity } from "../domain"
import { mapContentDoc } from "./content.mapper"

const REGEXP_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g

type ContentListFilter = {
  userId: string
  isDeleted: boolean
  libraryStatus?: LibraryStatus
  status?: ContentStatus
  $or?: {
    title?: { $regex: string; $options: string }
    summary?: { $regex: string; $options: string }
    sourceUrl?: { $regex: string; $options: string }
  }[]
}

function escapeRegExp(value: string): string {
  return value.replace(REGEXP_SPECIAL_CHARS, "\\$&")
}

@Injectable()
export class ContentQueryRepository {
  async findByIdForUser(
    userId: string,
    contentId: string
  ): Promise<ContentEntity | null> {
    if (!isValidObjectId(contentId)) return null
    const doc = await ContentModel.findOne({
      _id: contentId,
      userId,
      isDeleted: false,
    }).lean<IContent>()
    return doc ? mapContentDoc(doc) : null
  }

  async findByNormalizedUrl(
    userId: string,
    normalizedUrl: string
  ): Promise<ContentEntity | null> {
    const doc = await ContentModel.findOne({
      userId,
      normalizedUrl,
      isDeleted: false,
    }).lean<IContent>()
    return doc ? mapContentDoc(doc) : null
  }

  async findDuplicateByHash(input: {
    readonly userId: string
    readonly contentId: string
    readonly contentHash: string
  }): Promise<{ readonly id: string } | null> {
    if (!isValidObjectId(input.contentId)) return null
    const doc = await ContentModel.findOne({
      userId: input.userId,
      contentHash: input.contentHash,
      _id: { $ne: input.contentId },
      isDeleted: false,
    })
      .select({ _id: 1 })
      .lean<{ _id: Types.ObjectId }>()

    return doc ? { id: doc._id.toString() } : null
  }

  async listForUser(
    userId: string,
    query: ContentListQuery
  ): Promise<ContentEntity[]> {
    const search = query.search ? escapeRegExp(query.search) : undefined
    const filter: ContentListFilter = {
      userId,
      isDeleted: false,
      ...(query.libraryStatus ? { libraryStatus: query.libraryStatus } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(search
        ? {
            $or: [
              { title: { $regex: search, $options: "i" } },
              { summary: { $regex: search, $options: "i" } },
              { sourceUrl: { $regex: search, $options: "i" } },
            ],
          }
        : {}),
    }

    const docs = await ContentModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean<IContent[]>()

    return docs.map(mapContentDoc)
  }

  async findPendingOrStale(options: {
    readonly staleBefore: Date
    readonly statuses: readonly ContentStatus[]
    readonly limit: number
  }): Promise<ContentEntity[]> {
    const docs = await ContentModel.find({
      isDeleted: false,
      $or: [
        { status: "PENDING" },
        { status: "DEFERRED" },
        {
          status: { $in: [...options.statuses] },
          lockedAt: { $lt: options.staleBefore },
        },
      ],
    })
      .sort({ updatedAt: 1 })
      .limit(options.limit)
      .lean<IContent[]>()

    return docs.map(mapContentDoc)
  }
}
