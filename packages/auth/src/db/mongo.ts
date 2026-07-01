import { ObjectId } from "mongodb"
import { connectDb, getDb, getMongoClient, isDbConnected } from "@workspace/db"
import { env } from "@workspace/config"

/** Shared MongoDB handle — same pool as business API (`@workspace/db`). */
export function getAuthDb() {
  return getDb()
}

export function getAuthMongoClient() {
  return getMongoClient()
}

export async function ensureAuthMongoConnected() {
  if (!isDbConnected()) {
    await connectDb(env.MONGODB_URI)
  }
}

/** Better Auth stores foreign keys to `id` fields as ObjectIds in MongoDB. */
export function toMongoId(value: string) {
  return ObjectId.isValid(value) ? new ObjectId(value) : value
}
