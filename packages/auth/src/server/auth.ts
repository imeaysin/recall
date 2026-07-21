import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { admin } from "better-auth/plugins/admin"
import { env } from "@workspace/config"
import {
  SESSION_EXPIRES_IN_SECONDS,
  SESSION_UPDATE_AGE_SECONDS,
} from "../access"
import { buildSocialProviders, buildTrustedOrigins } from "./auth-options"
import { getAuthDb, getAuthMongoClient } from "./db"
import { authLifecycleHooks } from "./auth-lifecycle"

function parseAdminUserIds(value: string): readonly string[] {
  return value
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0)
}

/**
 * CogniVault auth (Better Auth recommended surface):
 * - OAuth Google/GitHub only (FR-1.1)
 * - Cookie sessions in Mongo (no Redis)
 * - Admin plugin for platform user management (`ADMIN_USER_IDS` + role)
 * - No organization/teams plugin — personal libraries are userId-scoped
 */
export function createAuth() {
  const adminUserIds = parseAdminUserIds(env.ADMIN_USER_IDS)

  return betterAuth({
    appName: env.APP_NAME,
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: buildTrustedOrigins(),
    database: mongodbAdapter(getAuthDb(), {
      client: getAuthMongoClient(),
    }),
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/social": { window: 60, max: 20 },
      },
    },
    session: {
      expiresIn: SESSION_EXPIRES_IN_SECONDS,
      updateAge: SESSION_UPDATE_AGE_SECONDS,
      storeSessionInDatabase: true,
    },
    emailAndPassword: {
      enabled: false,
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google", "github"],
      },
    },
    user: {
      deleteUser: {
        enabled: true,
      },
      additionalFields: {
        contentCount: {
          type: "number",
          required: false,
          defaultValue: 0,
          input: false,
        },
        dailyIngestionCount: {
          type: "number",
          required: false,
          defaultValue: 0,
          input: false,
        },
        dailyIngestionResetAt: {
          type: "date",
          required: false,
          defaultValue: () => new Date(),
          input: false,
        },
        plan: {
          type: "string",
          required: false,
          defaultValue: "FREE",
          input: false,
        },
      },
    },
    databaseHooks: {
      user: {
        delete: {
          before: async (user) => {
            const handler = authLifecycleHooks.onUserDeleted
            if (handler) await handler(user.id)
          },
        },
      },
    },
    socialProviders: buildSocialProviders(),
    plugins: [
      admin({
        ...(adminUserIds.length > 0 ? { adminUserIds: [...adminUserIds] } : {}),
      }),
    ],
  })
}

export type Auth = ReturnType<typeof createAuth>
