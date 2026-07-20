import { Injectable } from "@nestjs/common"
import { isValidObjectId } from "mongoose"
import { NoteModel } from "@workspace/db"
import type {
  NoteEntity,
  NoteActorScope,
  NoteListFilter,
} from "../domain/note.model"

const REGEXP_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g
const REGEXP_CASE_INSENSITIVE = "i" as const

function escapeRegExp(value: string): string {
  return value.replace(REGEXP_SPECIAL_CHARS, "\\$&")
}

function toNoteEntity(doc: {
  _id: { toString(): string }
  organizationId: string
  userId: string
  title: string
  body: string
  createdAt: Date
  updatedAt: Date
}): NoteEntity {
  return {
    id: doc._id.toString(),
    organizationId: doc.organizationId,
    userId: doc.userId,
    title: doc.title,
    body: doc.body,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

function buildActorFilter(scope: NoteActorScope) {
  return {
    organizationId: scope.organizationId,
    userId: scope.userId,
  }
}

function buildNoteSearchClauses(search: string) {
  const pattern = escapeRegExp(search)
  return [
    { title: { $regex: pattern, $options: REGEXP_CASE_INSENSITIVE } },
    { body: { $regex: pattern, $options: REGEXP_CASE_INSENSITIVE } },
  ]
}

@Injectable()
export class NoteQueryRepository {
  async findMany(
    scope: NoteActorScope,
    filter: NoteListFilter = {}
  ): Promise<NoteEntity[]> {
    const search = filter.search?.trim()
    const actorFilter = buildActorFilter(scope)
    const docs = await NoteModel.find(
      search
        ? { ...actorFilter, $or: buildNoteSearchClauses(search) }
        : actorFilter
    )
      .sort({ createdAt: -1 })
      .lean()

    return docs.map(toNoteEntity)
  }

  async findById(id: string): Promise<NoteEntity | null> {
    if (!isValidObjectId(id)) return null

    const doc = await NoteModel.findById(id).lean()
    if (!doc) return null

    return toNoteEntity(doc)
  }
}
