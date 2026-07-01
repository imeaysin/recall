import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose"
import { env } from "@workspace/config"

const jwks = createRemoteJWKSet(
  new URL(`${env.BETTER_AUTH_URL}/api/auth/jwks`),
  { cooldownDuration: 300_000 }
)

const verifyOptions = {
  issuer: env.BETTER_AUTH_URL,
  audience: env.BETTER_AUTH_URL,
} as const

export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, jwks, verifyOptions)
  return payload
}

export function isJwtExpiredError(error: unknown) {
  return (
    !!error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "ERR_JWT_EXPIRED"
  )
}
