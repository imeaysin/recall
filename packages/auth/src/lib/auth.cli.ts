import { connectDb } from "@workspace/db"
import { env } from "@workspace/config"
import { getAuth } from "./auth"

await connectDb(env.MONGODB_URI)

export const auth = getAuth()
