import { Inject, Injectable } from "@nestjs/common"
import { ObjectId, type Db } from "mongodb"
import { MONGO_DB } from "@/common/database/database.module"
import type {
  NewNotificationEntity,
  NotificationEntity,
  NotificationMutationScope,
  NotificationUserScope,
  NewDeviceTokenEntity,
  DeviceTokenEntity,
} from "../domain/notification.model"

const NOTIFICATIONS_COL = "notifications"
const TOKENS_COL = "deviceTokens"

@Injectable()
export class NotificationCommandRepository {
  constructor(@Inject(MONGO_DB) private readonly db: Db) {}

  async insert(data: NewNotificationEntity): Promise<NotificationEntity> {
    const now = new Date()
    const doc = {
      userId: data.userId,
      title: data.title,
      body: data.body,
      type: data.type,
      read: false,
      actionUrl: data.actionUrl,
      createdAt: now,
    }

    const { insertedId } = await this.db
      .collection<Omit<NotificationEntity, "_id">>(NOTIFICATIONS_COL)
      .insertOne(doc)

    return { _id: insertedId, ...doc }
  }

  async insertMany(items: NewNotificationEntity[]): Promise<number> {
    if (items.length === 0) return 0

    const now = new Date()
    const docs = items.map((data) => ({
      userId: data.userId,
      title: data.title,
      body: data.body,
      type: data.type,
      read: false,
      actionUrl: data.actionUrl,
      createdAt: now,
    }))

    const result = await this.db
      .collection<Omit<NotificationEntity, "_id">>(NOTIFICATIONS_COL)
      .insertMany(docs)

    return result.insertedCount
  }

  async markAsRead(scope: NotificationMutationScope): Promise<boolean> {
    if (!ObjectId.isValid(scope.notificationId)) return false

    const result = await this.db
      .collection<NotificationEntity>(NOTIFICATIONS_COL)
      .updateOne(
        { _id: new ObjectId(scope.notificationId), userId: scope.userId },
        { $set: { read: true } }
      )

    return result.modifiedCount > 0 || result.matchedCount > 0
  }

  async markAllAsRead(scope: NotificationUserScope): Promise<number> {
    const result = await this.db
      .collection<NotificationEntity>(NOTIFICATIONS_COL)
      .updateMany(
        { userId: scope.userId, read: false },
        { $set: { read: true } }
      )

    return result.modifiedCount
  }

  async delete(scope: NotificationMutationScope): Promise<boolean> {
    if (!ObjectId.isValid(scope.notificationId)) return false

    const result = await this.db
      .collection<NotificationEntity>(NOTIFICATIONS_COL)
      .deleteOne({
        _id: new ObjectId(scope.notificationId),
        userId: scope.userId,
      })

    return result.deletedCount > 0
  }

  async upsertToken(data: NewDeviceTokenEntity): Promise<DeviceTokenEntity> {
    const now = new Date()
    const col = this.db.collection<DeviceTokenEntity>(TOKENS_COL)

    const result = await col.findOneAndUpdate(
      { token: data.token },
      {
        $set: {
          userId: data.userId,
          platform: data.platform,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true, returnDocument: "after" }
    )

    if (!result) {
      throw new Error("upsert returned null — concurrent delete race")
    }

    return result
  }

  async removeByToken(token: string): Promise<boolean> {
    const result = await this.db
      .collection<DeviceTokenEntity>(TOKENS_COL)
      .deleteOne({ token })

    return result.deletedCount > 0
  }

  async removeByUserAndToken(userId: string, token: string): Promise<boolean> {
    const result = await this.db
      .collection<DeviceTokenEntity>(TOKENS_COL)
      .deleteOne({ userId, token })

    return result.deletedCount > 0
  }

  async removeManyByTokens(tokens: string[]): Promise<number> {
    if (tokens.length === 0) return 0

    const result = await this.db
      .collection<DeviceTokenEntity>(TOKENS_COL)
      .deleteMany({ token: { $in: tokens } })

    return result.deletedCount
  }
}
