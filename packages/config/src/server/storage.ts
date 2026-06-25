import { createEnv } from "../validate"
import {
  pickServerDefaults,
  storageEnvSchema,
  type StorageEnv,
} from "../schemas/server"

/** File storage — used by `@workspace/storage` and `apps/api` when wired. */
export const storageEnv = createEnv(
  storageEnvSchema,
  pickServerDefaults([
    "STORAGE_PROVIDER",
    "STORAGE_LOCAL_PATH",
    "STORAGE_LOCAL_URL",
    "STORAGE_S3_BUCKET",
    "STORAGE_S3_REGION",
    "STORAGE_S3_ENDPOINT",
    "STORAGE_S3_ACCESS_KEY_ID",
    "STORAGE_S3_SECRET_ACCESS_KEY",
    "STORAGE_S3_BASE_URL",
  ])
)

export type { StorageEnv }
