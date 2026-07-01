import type { AuthClient } from "../../lib/auth-client"
import { DEFAULT_JWT_STORAGE_KEY } from "../../lib/constants"
import { unwrapClientResult } from "./client-call"

export { DEFAULT_JWT_STORAGE_KEY }

export function clearStoredAuthJwt(jwtStorageKey = DEFAULT_JWT_STORAGE_KEY) {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem(jwtStorageKey)
  }
}

export async function refreshAuthToken(
  client: AuthClient,
  jwtStorageKey = DEFAULT_JWT_STORAGE_KEY
) {
  clearStoredAuthJwt(jwtStorageKey)
  return unwrapClientResult(client.token())
}
