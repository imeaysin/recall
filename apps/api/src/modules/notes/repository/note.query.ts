import { Inject, Injectable } from "@nestjs/common"
import { ObjectId, type Db } from "mongodb"
import { MONGO_DB } from "@/common/database/database.module"
import { BaseMongoRepository } from "@/common/database/repositories"
import type { NoteEntity, NoteActorScope } from "../domain/note.model"

const COLLECTION = "notes"

@Injectable()
export class NoteQueryRepository extends BaseMongoRepository {
  constructor(@Inject(MONGO_DB) private readonly db: Db) {
    super()
  }

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

  async findById(id: string): Promise<NoteEntity | null> {
    if (!ObjectId.isValid(id)) return null

    return this.db.collection<NoteEntity>(COLLECTION).findOne({
      _id: new ObjectId(id),
    })
  }
}
