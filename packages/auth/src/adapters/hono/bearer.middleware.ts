import { createMiddleware } from "hono/factory"
import { jwtVerify, createRemoteJWKSet } from "jose"
import { env } from "@workspace/config"

const JWKS = createRemoteJWKSet(
  new URL(`${env.BETTER_AUTH_URL}/api/auth/jwks`),
  { cooldownDuration: 300_000 }
)

export const bearerMiddleware = createMiddleware(async (c, next) => {
  const token = c.req.header("authorization")?.replace(/^Bearer\s+/i, "")?.trim()
  if (!token) {
    return c.json({ error: "Missing bearer token" }, 401)
  }

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: env.BETTER_AUTH_URL,
      audience: env.BETTER_AUTH_URL,
    })
    c.set("user", payload)
    await next()
  } catch {
    return c.json({ error: "Invalid token" }, 401)
  }
})
