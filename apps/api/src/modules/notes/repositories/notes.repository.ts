import { Injectable } from "@nestjs/common"
import { getDb } from "@workspace/db"
import { ObjectId } from "mongodb"
import { NoteEntity, NoteRecord, toNoteEntity } from "../entities/note.entity"

const COLLECTION = "notes"

@Injectable()
export class NotesRepository {
  async findByOrganizationAndUser(
    organizationId: string,
    userId: string
  ): Promise<NoteEntity[]> {
    const records = await getDb()
      .collection<NoteRecord>(COLLECTION)
      .find({ organizationId, userId })
      .sort({ createdAt: -1 })
      .toArray()

    return records.map(toNoteEntity)
  }

  async insert(
    data: Pick<NoteEntity, "organizationId" | "userId" | "title" | "body">
  ): Promise<NoteEntity> {
    const now = new Date()

    const { insertedId } = await getDb()
      .collection<Omit<NoteRecord, "_id">>(COLLECTION)
      .insertOne({
        organizationId: data.organizationId,
        userId: data.userId,
        title: data.title,
        body: data.body,
        createdAt: now,
        updatedAt: now,
      })

    return {
      id: insertedId.toString(),
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

    const record = await getDb()
      .collection<NoteRecord>(COLLECTION)
      .findOne({ _id: new ObjectId(id) })

    return record ? toNoteEntity(record) : null
  }

  async updateByIdForOrganizationAndUser(
    id: string,
    organizationId: string,
    userId: string,
    data: Partial<Pick<NoteEntity, "title" | "body">>
  ): Promise<NoteEntity | null> {
    if (!ObjectId.isValid(id)) return null

    const now = new Date()
    const result = await getDb()
      .collection<NoteRecord>(COLLECTION)
      .findOneAndUpdate(
        { _id: new ObjectId(id), organizationId, userId },
        {
          $set: {
            ...data,
            updatedAt: now,
          },
        },
        { returnDocument: "after" }
      )

    return result ? toNoteEntity(result) : null
  }

  async deleteByIdForOrganizationAndUser(
    id: string,
    organizationId: string,
    userId: string
  ): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false

    const result = await getDb()
      .collection<NoteRecord>(COLLECTION)
      .deleteOne({ _id: new ObjectId(id), organizationId, userId })

    return result.deletedCount > 0
  }

  async deleteManyByIdsForOrganizationAndUser(
    ids: string[],
    organizationId: string,
    userId: string
  ): Promise<number> {
    const objectIds = ids
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id))

    if (objectIds.length === 0) return 0

    const result = await getDb()
      .collection<NoteRecord>(COLLECTION)
      .deleteMany({ _id: { $in: objectIds }, organizationId, userId })

    return result.deletedCount
  }
}
