export const AUTH_BASE_PATH = "/api/auth" as const
export const WEB_TWO_FACTOR_PATH = "/auth/two-factor" as const

/** Session lifetime (cookie + DB row). Maps FR-1.4/1.7 refresh TTL (30 days). */
export const SESSION_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 30
/** How often an active session extends `expiresAt`. */
export const SESSION_UPDATE_AGE_SECONDS = 60 * 60 * 24
