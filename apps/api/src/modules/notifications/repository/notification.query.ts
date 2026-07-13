import { Inject, Injectable, type OnModuleInit } from "@nestjs/common"
import { type Db } from "mongodb"
import { MONGO_DB } from "@/common/database/database.module"
import type {
  NotificationEntity,
  DeviceTokenEntity,
  NotificationUserScope,
} from "../domain/notification.model"

const NOTIFICATIONS_COL = "notifications"
const TOKENS_COL = "deviceTokens"
const DEFAULT_LIMIT = 50

@Injectable()
export class NotificationQueryRepository implements OnModuleInit {
  constructor(@Inject(MONGO_DB) private readonly db: Db) {}

  async onModuleInit() {
    const notifCol = this.db.collection(NOTIFICATIONS_COL)
    await notifCol.createIndex({ userId: 1, createdAt: -1 })
    await notifCol.createIndex({ userId: 1, read: 1 })

    const tokenCol = this.db.collection(TOKENS_COL)
    await tokenCol.createIndex({ userId: 1, token: 1 }, { unique: true })
    await tokenCol.createIndex({ token: 1 }, { unique: true })
    await tokenCol.createIndex({ userId: 1 })
  }

  async findByUser(
    scope: NotificationUserScope,
    limit = DEFAULT_LIMIT
  ): Promise<NotificationEntity[]> {
    return this.db
      .collection<NotificationEntity>(NOTIFICATIONS_COL)
      .find({ userId: scope.userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()
  }

  async countUnread(scope: NotificationUserScope): Promise<number> {
    return this.db
      .collection<NotificationEntity>(NOTIFICATIONS_COL)
      .countDocuments({ userId: scope.userId, read: false })
  }

  async findTokensByUserId(userId: string): Promise<DeviceTokenEntity[]> {
    return this.db
      .collection<DeviceTokenEntity>(TOKENS_COL)
      .find({ userId })
      .toArray()
  }

  async findTokensByUserIds(userIds: string[]): Promise<DeviceTokenEntity[]> {
    if (userIds.length === 0) return []

    return this.db
      .collection<DeviceTokenEntity>(TOKENS_COL)
      .find({ userId: { $in: userIds } })
      .toArray()
  }
}
