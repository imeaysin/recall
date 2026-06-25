import { z } from "zod"

const webClientSchema = z.object({
  VITE_API_URL: z.string().url().optional(),
  VITE_AUTH_URL: z.string().url().optional(),
  VITE_APP_NAME: z.string().min(1).optional(),
})

const marketingClientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_AUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).optional(),
})

const mobileClientSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string().url().optional(),
  EXPO_PUBLIC_AUTH_URL: z.string().url().optional(),
  EXPO_PUBLIC_APP_NAME: z.string().min(1).optional(),
})

const defaultApiUrl = "http://localhost:4000"
const defaultAppName = "Theo"

export interface ClientPublicEnv {
  apiUrl: string
  authUrl: string
  appName: string
}

function resolveClientUrls(
  source: Record<string, string | undefined>
): ClientPublicEnv {
  const apiUrl =
    source.VITE_API_URL ??
    source.NEXT_PUBLIC_API_URL ??
    source.EXPO_PUBLIC_API_URL ??
    defaultApiUrl

  const authUrl =
    source.VITE_AUTH_URL ??
    source.NEXT_PUBLIC_AUTH_URL ??
    source.EXPO_PUBLIC_AUTH_URL ??
    apiUrl

  const appName =
    source.VITE_APP_NAME ??
    source.NEXT_PUBLIC_APP_NAME ??
    source.EXPO_PUBLIC_APP_NAME ??
    defaultAppName

  return { apiUrl, authUrl, appName }
}

/** `apps/web` (Vite) — pass `import.meta.env`. */
export function parseWebEnv(
  source: Record<string, string | undefined>
): ClientPublicEnv {
  webClientSchema.parse(source)
  return resolveClientUrls(source)
}

/** `apps/marketing` (Next.js) — pass `process.env`. */
export function parseMarketingEnv(
  source: Record<string, string | undefined> = process.env
): ClientPublicEnv {
  marketingClientSchema.parse(source)
  return resolveClientUrls(source)
}

/** `apps/mobile` (Expo) — pass `process.env`. */
export function parseMobileEnv(
  source: Record<string, string | undefined> = process.env
): ClientPublicEnv {
  mobileClientSchema.parse(source)
  return resolveClientUrls(source)
}

/**
 * Generic client env parser — used by shared packages (`@workspace/auth/client`).
 * Prefer app-specific parsers in application code when possible.
 */
export function parseClientPublicEnv(
  source: Record<string, string | undefined>
): ClientPublicEnv {
  return resolveClientUrls(source)
}
