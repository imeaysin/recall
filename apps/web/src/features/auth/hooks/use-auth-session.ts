import { useSyncExternalStore } from "react"
import { authClient } from "@/lib/auth"

type AuthSessionState = ReturnType<typeof authClient.useSession.get>

function getAuthSessionState(): AuthSessionState {
  return authClient.useSession.get()
}

export function useAuthSession(): AuthSessionState {
  return useSyncExternalStore(
    (onStoreChange) => authClient.useSession.subscribe(onStoreChange),
    getAuthSessionState,
    getAuthSessionState
  )
}
