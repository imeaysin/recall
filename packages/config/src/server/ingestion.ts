import { createEnv } from "../validate"
import {
  ingestionEnvSchema,
  pickServerDefaults,
  type IngestionEnv,
} from "../schemas/server"

/** Content ingestion limits — consumed by API content/ingestion modules. */
export const ingestionEnv = createEnv(
  ingestionEnvSchema,
  pickServerDefaults([
    "DAILY_INGESTION_CAP",
    "INGESTION_STALE_JOB_MS",
    "INGESTION_MAX_RETRIES",
    "CONTENT_TRASH_RETENTION_DAYS",
    "CONTENT_UPLOAD_MAX_BYTES",
  ])
)

export type { IngestionEnv }
