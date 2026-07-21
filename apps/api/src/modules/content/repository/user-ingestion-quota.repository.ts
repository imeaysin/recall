import { Injectable } from "@nestjs/common"
import { Types } from "mongoose"
import { ingestionEnv } from "@workspace/config/ingestion"
import { getDb } from "@workspace/db"

type IngestionUserDoc = {
  readonly dailyIngestionCount?: number
  readonly dailyIngestionResetAt?: Date
}

export type ReserveIngestionSlotResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "at_cap" | "user_missing" }

const AUTH_USER_COLLECTION = "user" as const

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
}

/** Better Auth Mongo adapter stores app `id` as document `_id` (ObjectId). */
function authUserFilter(userId: string) {
  return { _id: new Types.ObjectId(userId) }
}

function countForCurrentUtcDay(user: IngestionUserDoc, now: Date): number {
  const resetAt = user.dailyIngestionResetAt
    ? new Date(user.dailyIngestionResetAt)
    : undefined
  if (!resetAt || resetAt < startOfUtcDay(now)) return 0
  return user.dailyIngestionCount ?? 0
}

@Injectable()
export class UserIngestionQuotaRepository {
  async hasReachedDailyCap(userId: string): Promise<boolean> {
    const user = await this.users().findOne<IngestionUserDoc>(
      authUserFilter(userId)
    )
    if (!user) return false
    return (
      countForCurrentUtcDay(user, new Date()) >=
      ingestionEnv.DAILY_INGESTION_CAP
    )
  }

  async tryReserveIngestionSlot(
    userId: string
  ): Promise<ReserveIngestionSlotResult> {
    const match = authUserFilter(userId)
    const now = new Date()
    await this.resetCounterIfStale(match, now)
    const reserved = await this.incrementIfUnderCap(match, now)
    if (reserved) return { ok: true }
    const exists = await this.users().findOne(match, { projection: { _id: 1 } })
    if (!exists) return { ok: false, reason: "user_missing" }
    return { ok: false, reason: "at_cap" }
  }

  async releaseIngestionSlot(userId: string): Promise<void> {
    const now = new Date()
    await this.users().updateOne(
      {
        ...authUserFilter(userId),
        dailyIngestionCount: { $gt: 0 },
        dailyIngestionResetAt: { $gte: startOfUtcDay(now) },
      },
      { $inc: { dailyIngestionCount: -1, contentCount: -1 } }
    )
  }

  async decrementContentCount(userId: string): Promise<void> {
    await this.users().updateOne(
      {
        ...authUserFilter(userId),
        contentCount: { $gt: 0 },
      },
      { $inc: { contentCount: -1 } }
    )
  }

  async incrementContentCount(userId: string): Promise<void> {
    await this.users().updateOne(authUserFilter(userId), {
      $inc: { contentCount: 1 },
    })
  }

  private users() {
    return getDb().collection(AUTH_USER_COLLECTION)
  }

  private async resetCounterIfStale(
    match: ReturnType<typeof authUserFilter>,
    now: Date
  ): Promise<void> {
    await this.users().updateOne(
      {
        $and: [
          match,
          {
            $or: [
              { dailyIngestionResetAt: { $lt: startOfUtcDay(now) } },
              { dailyIngestionResetAt: { $exists: false } },
              { dailyIngestionResetAt: null },
            ],
          },
        ],
      },
      {
        $set: { dailyIngestionCount: 0, dailyIngestionResetAt: now },
      }
    )
  }

  private async incrementIfUnderCap(
    match: ReturnType<typeof authUserFilter>,
    now: Date
  ): Promise<boolean> {
    const reserved = await this.users().findOneAndUpdate(
      {
        $and: [
          match,
          {
            $or: [
              {
                dailyIngestionCount: {
                  $lt: ingestionEnv.DAILY_INGESTION_CAP,
                },
              },
              { dailyIngestionCount: { $exists: false } },
              { dailyIngestionCount: null },
            ],
          },
        ],
      },
      {
        $inc: { dailyIngestionCount: 1, contentCount: 1 },
        $set: { dailyIngestionResetAt: now },
      },
      { returnDocument: "after" }
    )
    return Boolean(reserved)
  }
}
