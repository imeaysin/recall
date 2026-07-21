import { Injectable } from "@nestjs/common"
import { getDb } from "@workspace/db"
import { ingestionEnv } from "@workspace/config/ingestion"

type IngestionUserDoc = {
  readonly dailyIngestionCount?: number
  readonly dailyIngestionResetAt?: Date
}

export type ReserveIngestionSlotResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "at_cap" | "user_missing" }

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
}

@Injectable()
export class UserIngestionQuotaRepository {
  async hasReachedDailyCap(userId: string): Promise<boolean> {
    const user = await getDb()
      .collection("user")
      .findOne<IngestionUserDoc>({ id: userId })

    if (!user) return false

    const now = new Date()
    const resetAt = user.dailyIngestionResetAt
      ? new Date(user.dailyIngestionResetAt)
      : undefined
    const dayStart = startOfUtcDay(now)
    const count =
      resetAt && resetAt >= dayStart ? (user.dailyIngestionCount ?? 0) : 0

    return count >= ingestionEnv.DAILY_INGESTION_CAP
  }

  /**
   * Atomically reserves one daily ingestion slot and increments contentCount.
   * Resets the daily counter at UTC midnight before applying the cap check.
   */
  async tryReserveIngestionSlot(
    userId: string
  ): Promise<ReserveIngestionSlotResult> {
    const users = getDb().collection("user")
    const now = new Date()
    const dayStart = startOfUtcDay(now)

    await users.updateOne(
      {
        id: userId,
        $or: [
          { dailyIngestionResetAt: { $lt: dayStart } },
          { dailyIngestionResetAt: { $exists: false } },
          { dailyIngestionResetAt: null },
        ],
      },
      {
        $set: {
          dailyIngestionCount: 0,
          dailyIngestionResetAt: now,
        },
      }
    )

    const reserved = await users.findOneAndUpdate(
      {
        id: userId,
        dailyIngestionCount: { $lt: ingestionEnv.DAILY_INGESTION_CAP },
      },
      {
        $inc: { dailyIngestionCount: 1, contentCount: 1 },
        $set: { dailyIngestionResetAt: now },
      },
      { returnDocument: "after" }
    )

    if (reserved) return { ok: true }

    const exists = await users.findOne(
      { id: userId },
      { projection: { id: 1 } }
    )
    if (!exists) return { ok: false, reason: "user_missing" }
    return { ok: false, reason: "at_cap" }
  }

  async releaseIngestionSlot(userId: string): Promise<void> {
    const users = getDb().collection("user")
    const now = new Date()
    const dayStart = startOfUtcDay(now)

    await users.updateOne(
      {
        id: userId,
        dailyIngestionCount: { $gt: 0 },
        dailyIngestionResetAt: { $gte: dayStart },
      },
      {
        $inc: { dailyIngestionCount: -1, contentCount: -1 },
      }
    )
  }

  async decrementContentCount(userId: string): Promise<void> {
    await getDb()
      .collection("user")
      .updateOne(
        { id: userId, contentCount: { $gt: 0 } },
        { $inc: { contentCount: -1 } }
      )
  }
}
