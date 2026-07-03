import { HttpStatus, HttpException } from "@nestjs/common"
import type { INestApplication } from "@nestjs/common"
import { isDbConnected } from "@workspace/db"
import { createLogger } from "@workspace/logger"
import type { Db } from "mongodb"
import type { NextFunction, Request, Response } from "express"
import { buildErrorEnvelope } from "../filters/http-exception.utils"

const COLLECTION = "api_rate_limits"
const logger = createLogger("RateLimit")

export type RateLimitOptions = {
  enabled: boolean
  windowMs: number
  max: number
  getDb: () => Db
}

let indexEnsured = false

async function ensureIndex(db: Db) {
  if (indexEnsured) return
  await db
    .collection(COLLECTION)
    .createIndex({ resetAt: 1 }, { expireAfterSeconds: 0 })
  indexEnsured = true
}

async function isAllowed(
  db: Db,
  key: string,
  windowMs: number,
  max: number
): Promise<boolean> {
  await ensureIndex(db)

  const now = new Date()
  const col = db.collection<{ _id: string; count: number; resetAt: Date }>(
    COLLECTION
  )
  const existing = await col.findOne({ _id: key })

  if (!existing || existing.resetAt <= now) {
    await col.updateOne(
      { _id: key },
      { $set: { count: 1, resetAt: new Date(now.getTime() + windowMs) } },
      { upsert: true }
    )
    return true
  }

  if (existing.count >= max) {
    return false
  }

  await col.updateOne({ _id: key }, { $inc: { count: 1 } })
  return true
}

function shouldSkip(path: string): boolean {
  return (
    path.startsWith("/api/auth") ||
    path.startsWith("/docs") ||
    path.includes("/health")
  )
}

function clientKey(request: Request): string {
  const ip = request.ip || request.socket.remoteAddress || "unknown"
  return `ip:${ip}`
}

export function applyRateLimit(
  app: INestApplication,
  options: RateLimitOptions
) {
  if (!options.enabled) return

  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (shouldSkip(req.path)) {
      next()
      return
    }

    if (!isDbConnected()) {
      next()
      return
    }

    try {
      const allowed = await isAllowed(
        options.getDb(),
        clientKey(req),
        options.windowMs,
        options.max
      )

      if (!allowed) {
        const exception = new HttpException(
          "Too many requests. Please try again later.",
          HttpStatus.TOO_MANY_REQUESTS
        )
        res
          .status(HttpStatus.TOO_MANY_REQUESTS)
          .json(
            buildErrorEnvelope(exception, HttpStatus.TOO_MANY_REQUESTS, req)
          )
        return
      }

      next()
    } catch (err) {
      logger.warn({ err }, "rate limit check failed — allowing request")
      next()
    }
  })
}
