import { createEnv } from "../validate"
import {
  cacheEnvSchema,
  pickServerDefaults,
  type CacheEnv,
} from "../schemas/server"

/** Cache provider config — used by `@workspace/cache` and `apps/api`. */
export const cacheEnv = createEnv(
  cacheEnvSchema,
  pickServerDefaults(["CACHE_PROVIDER", "REDIS_URL"])
)

export type { CacheEnv }
