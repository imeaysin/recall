import { Inject, Injectable } from "@nestjs/common"
import { DomainErrorCode } from "@workspace/contracts"
import { ObjectId, type Db } from "mongodb"
import { MONGO_DB } from "@/common/database/database.module"
import { apiNotFound } from "@/common/exceptions/api.exception"
import type { NewNoteEntity, NoteEntity } from "../entities/note.entity"
import { assertNoteAccessOrThrow } from "../notes-access.util"
import type {
  BulkNoteMutationScope,
  NoteActorScope,
  NoteMutationScope,
} from "../note.scope"

const COLLECTION = "notes"

@Injectable()
export class NotesRepository {
  constructor(@Inject(MONGO_DB) private readonly db: Db) {}

  async findMany(scope: NoteActorScope): Promise<NoteEntity[]> {
    return this.db
      .collection<NoteEntity>(COLLECTION)
      .find({
        organizationId: scope.organizationId,
        userId: scope.userId,
      })
      .sort({ createdAt: -1 })
      .toArray()
  }

  async insert(data: NewNoteEntity): Promise<NoteEntity> {
    const now = new Date()

    const { insertedId } = await this.db
      .collection<Omit<NoteEntity, "_id">>(COLLECTION)
      .insertOne({
        organizationId: data.organizationId,
        userId: data.userId,
        title: data.title,
        body: data.body,
        createdAt: now,
        updatedAt: now,
      })

    return {
      _id: insertedId,
      organizationId: data.organizationId,
      userId: data.userId,
      title: data.title,
      body: data.body,
      createdAt: now,
      updatedAt: now,
    }
  }

  async findById(id: string): Promise<NoteEntity | null> {
    if (!ObjectId.isValid(id)) return null

    return this.db.collection<NoteEntity>(COLLECTION).findOne({
      _id: new ObjectId(id),
    })
  }

  async update(
    scope: NoteMutationScope,
    data: Partial<Pick<NoteEntity, "title" | "body">>
  ): Promise<NoteEntity | null> {
    if (!ObjectId.isValid(scope.noteId)) return null

    const now = new Date()
    return this.db.collection<NoteEntity>(COLLECTION).findOneAndUpdate(
      {
        _id: new ObjectId(scope.noteId),
        organizationId: scope.organizationId,
        userId: scope.userId,
      },
      {
        $set: {
          ...data,
          updatedAt: now,
        },
      },
      { returnDocument: "after" }
    )
  }

  async delete(scope: NoteMutationScope): Promise<boolean> {
    if (!ObjectId.isValid(scope.noteId)) return false

    const result = await this.db.collection<NoteEntity>(COLLECTION).deleteOne({
      _id: new ObjectId(scope.noteId),
      organizationId: scope.organizationId,
      userId: scope.userId,
    })

    return result.deletedCount > 0
  }

  async deleteMany(scope: BulkNoteMutationScope): Promise<number> {
    const objectIds = scope.ids
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id))

    if (objectIds.length === 0) return 0

    const result = await this.db.collection<NoteEntity>(COLLECTION).deleteMany({
      _id: { $in: objectIds },
      organizationId: scope.organizationId,
      userId: scope.userId,
    })

    return result.deletedCount
  }

  async deleteManyOrThrow(scope: BulkNoteMutationScope): Promise<number> {
    const uniqueValidIds = [
      ...new Set(scope.ids.filter((id) => ObjectId.isValid(id))),
    ]
    const deletedCount = await this.deleteMany(scope)

    const hasInvalidId = scope.ids.some((id) => !ObjectId.isValid(id))
    if (hasInvalidId || deletedCount < uniqueValidIds.length) {
      await this.rejectBulkMutationMiss(scope)
    }

    return deletedCount
  }

  async rejectBulkMutationMiss(scope: BulkNoteMutationScope): Promise<never> {
    for (const id of scope.ids) {
      const existing = await this.findById(id)
      assertNoteAccessOrThrow(existing, scope.organizationId)
    }
    apiNotFound("Note not found", DomainErrorCode.NOTE_NOT_FOUND)
  }

  async rejectMutationMiss(scope: NoteMutationScope): Promise<never> {
    const existing = await this.findById(scope.noteId)
    assertNoteAccessOrThrow(existing, scope.organizationId)
  }
}
