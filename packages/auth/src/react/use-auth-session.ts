import { useSyncExternalStore } from "react"
import { authClient, type AuthClient } from "../lib/auth-client"

type AuthSessionState = ReturnType<AuthClient["useSession"]["get"]>

function getAuthSessionState(client: AuthClient): AuthSessionState {
  return client.useSession.get()
}

export function useAuthSession(
  client: AuthClient = authClient
): AuthSessionState {
  return useSyncExternalStore(
    (onStoreChange) => client.useSession.subscribe(onStoreChange),
    () => getAuthSessionState(client),
    () => getAuthSessionState(client)
  )
}
