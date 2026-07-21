import { z } from "zod"
import {
  DEFAULT_APP_NAME,
  DEFAULT_PORT,
  DEV_ALLOWED_ORIGINS,
  DEV_URLS,
} from "../constants"

const sharedSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  APP_NAME: z.string().min(1).default(DEFAULT_APP_NAME),
  PORT: z.coerce.number().int().positive().default(DEFAULT_PORT),
})

const databaseSchema = z.object({
  MONGODB_URI: z.string().min(1),
})

const urlsSchema = z.object({
  BETTER_AUTH_URL: z.string().url(),
  CLIENT_URL: z.string().url(),
  MARKETING_URL: z.string().url(),
  ALLOWED_ORIGINS: z.string().min(1),
})

const authSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  GITHUB_CLIENT_ID: z.string().default(""),
  GITHUB_CLIENT_SECRET: z.string().default(""),
  /** Comma-separated Better Auth user IDs treated as platform admins. */
  ADMIN_USER_IDS: z.string().default(""),
})

const emailSchema = z.object({
  EMAIL_PROVIDER: z.enum(["resend", "mock"]).default("mock"),
  RESEND_API_KEY: z.string().default(""),
  EMAIL_FROM: z.string().min(1).optional(),
})

const storageSchema = z.object({
  STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
  STORAGE_LOCAL_PATH: z.string().default("./uploads"),
  STORAGE_LOCAL_URL: z.string().default(`${DEV_URLS.API}/uploads`),
  /** HMAC secret for local signed download URLs. Empty → use BETTER_AUTH_SECRET at runtime. */
  STORAGE_SIGNING_SECRET: z.string().default(""),
  STORAGE_S3_BUCKET: z.string().default(""),
  STORAGE_S3_REGION: z.string().default(""),
  STORAGE_S3_ENDPOINT: z.string().default(""),
  STORAGE_S3_ACCESS_KEY_ID: z.string().default(""),
  STORAGE_S3_SECRET_ACCESS_KEY: z.string().default(""),
  STORAGE_S3_BASE_URL: z.string().default(""),
})

const aiSchema = z.object({
  GEMINI_API_KEY: z.string().default(""),
  GEMINI_FLASH_MODEL: z.string().default("gemini-3.6-flash"),
  GEMINI_EMBEDDING_MODEL: z.string().default("gemini-embedding-2"),
  AI_FLASH_DAILY_REQUEST_CAP: z.coerce.number().int().positive().default(1400),
  AI_EMBEDDING_DAILY_REQUEST_CAP: z.coerce
    .number()
    .int()
    .positive()
    .default(1400),
})

const ingestionSchema = z.object({
  DAILY_INGESTION_CAP: z.coerce.number().int().positive().default(50),
  INGESTION_STALE_JOB_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(5 * 60 * 1000),
  INGESTION_MAX_RETRIES: z.coerce.number().int().nonnegative().default(3),
  CONTENT_TRASH_RETENTION_DAYS: z.coerce.number().int().positive().default(30),
  CONTENT_UPLOAD_MAX_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(15_000_000),
})

const rateLimitSchema = z.object({
  RATE_LIMIT_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
})

const observabilitySchema = z.object({
  SENTRY_DSN: z.string().default(""),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().default(""),
  OTEL_SERVICE_NAME: z.string().min(1).default("api"),
})

export const serverSchema = sharedSchema
  .extend(databaseSchema.shape)
  .extend(urlsSchema.shape)
  .extend(authSchema.shape)
  .extend(emailSchema.shape)
  .extend(storageSchema.shape)
  .extend(aiSchema.shape)
  .extend(ingestionSchema.shape)
  .extend(rateLimitSchema.shape)
  .extend(observabilitySchema.shape)

export const serverDefaults = {
  NODE_ENV: "development",
  APP_NAME: DEFAULT_APP_NAME,
  PORT: DEFAULT_PORT,
  MONGODB_URI: "mongodb://localhost:27017/theo",
  BETTER_AUTH_URL: DEV_URLS.API,
  CLIENT_URL: DEV_URLS.WEB,
  MARKETING_URL: DEV_URLS.MARKETING,
  ALLOWED_ORIGINS: DEV_ALLOWED_ORIGINS,
  BETTER_AUTH_SECRET:
    "j6K#v9$e8f7037b453c8a6b455a6fe9cc7e5d1438af032e3bf8731affcea1e9967481d7!z8*Nq5&W3tY7uB9xCcE1",
  EMAIL_PROVIDER: "mock",
  RESEND_API_KEY: "",
  GOOGLE_CLIENT_ID: "",
  GOOGLE_CLIENT_SECRET: "",
  GITHUB_CLIENT_ID: "",
  GITHUB_CLIENT_SECRET: "",
  ADMIN_USER_IDS: "",
  STORAGE_PROVIDER: "local",
  STORAGE_LOCAL_PATH: "./uploads",
  STORAGE_LOCAL_URL: `${DEV_URLS.API}/uploads`,
  STORAGE_SIGNING_SECRET: "",
  STORAGE_S3_BUCKET: "",
  STORAGE_S3_REGION: "",
  STORAGE_S3_ENDPOINT: "",
  STORAGE_S3_ACCESS_KEY_ID: "",
  STORAGE_S3_SECRET_ACCESS_KEY: "",
  STORAGE_S3_BASE_URL: "",
  GEMINI_API_KEY: "",
  GEMINI_FLASH_MODEL: "gemini-3.6-flash",
  GEMINI_EMBEDDING_MODEL: "gemini-embedding-2",
  AI_FLASH_DAILY_REQUEST_CAP: 1400,
  AI_EMBEDDING_DAILY_REQUEST_CAP: 1400,
  DAILY_INGESTION_CAP: 50,
  INGESTION_STALE_JOB_MS: 5 * 60 * 1000,
  INGESTION_MAX_RETRIES: 3,
  CONTENT_TRASH_RETENTION_DAYS: 30,
  CONTENT_UPLOAD_MAX_BYTES: 15_000_000,
  SENTRY_DSN: "",
  OTEL_EXPORTER_OTLP_ENDPOINT: "",
  OTEL_SERVICE_NAME: "api",
} as const satisfies z.input<typeof serverSchema>

/** Subset schemas — derived from the full server schema so keys stay in sync. */
export const databaseEnvSchema = serverSchema.pick({ MONGODB_URI: true })

export const emailEnvSchema = serverSchema.pick({
  EMAIL_PROVIDER: true,
  RESEND_API_KEY: true,
  EMAIL_FROM: true,
  APP_NAME: true,
  BETTER_AUTH_URL: true,
})

export const storageEnvSchema = serverSchema.pick({
  STORAGE_PROVIDER: true,
  STORAGE_LOCAL_PATH: true,
  STORAGE_LOCAL_URL: true,
  STORAGE_SIGNING_SECRET: true,
  STORAGE_S3_BUCKET: true,
  STORAGE_S3_REGION: true,
  STORAGE_S3_ENDPOINT: true,
  STORAGE_S3_ACCESS_KEY_ID: true,
  STORAGE_S3_SECRET_ACCESS_KEY: true,
  STORAGE_S3_BASE_URL: true,
})

export const aiEnvSchema = serverSchema.pick({
  GEMINI_API_KEY: true,
  GEMINI_FLASH_MODEL: true,
  GEMINI_EMBEDDING_MODEL: true,
  AI_FLASH_DAILY_REQUEST_CAP: true,
  AI_EMBEDDING_DAILY_REQUEST_CAP: true,
})

export const ingestionEnvSchema = serverSchema.pick({
  DAILY_INGESTION_CAP: true,
  INGESTION_STALE_JOB_MS: true,
  INGESTION_MAX_RETRIES: true,
  CONTENT_TRASH_RETENTION_DAYS: true,
  CONTENT_UPLOAD_MAX_BYTES: true,
})

export type ServerEnv = z.infer<typeof serverSchema>
export type DatabaseEnv = z.infer<typeof databaseEnvSchema>
export type EmailEnv = z.infer<typeof emailEnvSchema>
export type StorageEnv = z.infer<typeof storageEnvSchema>
export type AiEnv = z.infer<typeof aiEnvSchema>
export type IngestionEnv = z.infer<typeof ingestionEnvSchema>

export function pickServerDefaults<const K extends keyof typeof serverDefaults>(
  keys: readonly K[]
): Pick<typeof serverDefaults, K> {
  return Object.fromEntries(
    keys.map((key) => [key, serverDefaults[key]])
  ) as Pick<typeof serverDefaults, K>
}
