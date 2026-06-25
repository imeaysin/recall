import { createEnv } from "../validate"
import {
  serverDefaults,
  serverSchema,
  type ServerEnv,
} from "../schemas/server"

/** Full server environment — used by `apps/api` and `@workspace/auth`. */
export const env = createEnv(serverSchema, serverDefaults)

export type { ServerEnv }
