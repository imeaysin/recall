/**
 * Promotes a user to platform admin by email.
 * Usage: SKIP_ENV_VALIDATION=true pnpm --filter api exec ts-node --transpile-only scripts/promote-admin.ts user@example.com
 */
import { MongoClient } from "mongodb"
import { env } from "@workspace/config"

async function main() {
  const email = process.argv[2]?.trim().toLowerCase()
  if (!email) {
    console.error("Usage: promote-admin.ts <email>")
    process.exit(1)
  }

  const client = new MongoClient(env.MONGODB_URI)
  await client.connect()
  const db = client.db()

  const result = await db
    .collection("user")
    .updateOne({ email }, { $set: { role: "admin" } })

  if (result.matchedCount === 0) {
    console.error(`No user found with email ${email}`)
    await client.close()
    process.exit(1)
  }

  console.log(`Promoted ${email} to platform admin`)
  await client.close()
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
