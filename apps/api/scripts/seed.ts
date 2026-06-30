/**
 * Seeds sample notes for the first user in the database.
 * Sign up via the web app first, then run: pnpm --filter api seed
 */
import { MongoClient } from "mongodb"
import { env } from "@workspace/config"

async function main() {
  const client = new MongoClient(env.MONGODB_URI)
  await client.connect()
  const db = client.db()

  const user = await db.collection("user").findOne({})
  if (!user || typeof user.id !== "string") {
    console.log("No users found. Sign up at the web app, then re-run seed.")
    await client.close()
    return
  }

  const now = new Date()
  const notes = [
    {
      userId: user.id,
      title: "Welcome to Theo",
      body: "This note was created by `pnpm --filter api seed`.",
      createdAt: now,
      updatedAt: now,
    },
    {
      userId: user.id,
      title: "Try the API",
      body: "Open Swagger at /docs or use the Notes page in the web app.",
      createdAt: now,
      updatedAt: now,
    },
  ]

  const existing = await db
    .collection("notes")
    .countDocuments({ userId: user.id })
  if (existing > 0) {
    console.log(
      `User ${user.email} already has ${existing} note(s). Skipping seed.`
    )
    await client.close()
    return
  }

  await db.collection("notes").insertMany(notes)
  console.log(`Seeded ${notes.length} notes for ${user.email}`)
  await client.close()
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
