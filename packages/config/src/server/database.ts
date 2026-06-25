import { createEnv } from "../validate"
import {
  databaseEnvSchema,
  pickServerDefaults,
  type DatabaseEnv,
} from "../schemas/server"

/** Database connection — used by `@workspace/db`. */
export const databaseEnv = createEnv(
  databaseEnvSchema,
  pickServerDefaults(["MONGODB_URI"])
)

export type { DatabaseEnv }
