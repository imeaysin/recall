"use client"

import {
  useAuth,
  useListSessions,
  useRevokeSession,
  useSession,
  useSignOut,
} from "@better-auth-ui/react"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { useState } from "react"
import { toast } from "sonner"

/**
 * Revoke every session except the current one, then sign out locally.
 */
export function LogoutEverywhere() {
  const { authClient } = useAuth()
  const { data: session } = useSession(authClient)
  const { data: sessions } = useListSessions(authClient)
  const { mutateAsync: revokeSession } = useRevokeSession(authClient)
  const { mutateAsync: signOut } = useSignOut(authClient)
  const [busy, setBusy] = useState(false)

  const currentToken = session?.session.token

  async function handleLogoutEverywhere() {
    if (
      !window.confirm(
        "Sign out on all devices? Other sessions will be revoked, then you will be signed out here."
      )
    ) {
      return
    }

    setBusy(true)
    try {
      const others = (sessions ?? []).filter(
        (active) => active.token !== currentToken
      )
      for (const active of others) {
        await revokeSession(active)
      }
      await signOut()
      toast.success("Signed out everywhere")
    } catch {
      toast.error("Could not sign out on all devices")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={busy || !currentToken}
      onClick={() => void handleLogoutEverywhere()}
    >
      {busy ? <Spinner /> : null}
      Sign out everywhere
    </Button>
  )
}
