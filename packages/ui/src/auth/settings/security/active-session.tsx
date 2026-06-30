"use client"

import {
  useAuthUiConfig,
  useRevokeSession,
  useSession,
} from "@workspace/auth/react"
import { LogOut, Monitor, Smartphone, X } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardPanel } from "@workspace/ui/components/card"
import { Spinner } from "@workspace/ui/components/spinner"
import { toastManager } from "@workspace/ui/components/toast"
import { parseUserAgent } from "../../utils/parse-user-agent"

function parseCreatedAt(value?: Date | string): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  return new Date(value)
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ]

  for (const [unit, threshold] of units) {
    if (seconds >= threshold) {
      return rtf.format(-Math.floor(seconds / threshold), unit)
    }
  }

  return rtf.format(0, "second")
}

export interface ActiveSessionProps {
  activeSession: {
    id: string
    token: string
    userAgent?: string | null
    createdAt?: Date | string
  }
}

export function ActiveSession({ activeSession }: ActiveSessionProps) {
  const config = useAuthUiConfig()
  const { data: session } = useSession()
  const { mutate: revokeSession, isPending: isRevoking } = useRevokeSession()

  const isCurrentSession = activeSession.token === session?.session.token
  const ua = parseUserAgent(activeSession.userAgent)
  const createdAt = parseCreatedAt(activeSession.createdAt)

  let sessionMeta: ReactNode = null
  if (isCurrentSession) {
    sessionMeta = (
      <span className="w-fit rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        Current session
      </span>
    )
  } else if (createdAt) {
    sessionMeta = (
      <span className="text-xs text-muted-foreground capitalize">
        {timeAgo(createdAt)}
      </span>
    )
  }

  let actionIcon: ReactNode = <X />
  if (isRevoking) actionIcon = <Spinner />
  else if (isCurrentSession) actionIcon = <LogOut />

  const actionLabel = isCurrentSession ? "Sign out" : "Revoke"

  return (
    <Card className="border-0 bg-transparent shadow-none ring-0">
      <CardPanel className="flex items-center justify-between gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
          {ua.isMobile ? (
            <Smartphone className="size-4.5" />
          ) : (
            <Monitor className="size-4.5" />
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">
            {ua.browserName}
            {ua.osName ? `, ${ua.osName}` : ""}
          </span>

          {sessionMeta}
        </div>

        <Button
          aria-label={isCurrentSession ? "Sign out" : "Revoke session"}
          className="ml-auto shrink-0"
          disabled={isRevoking}
          onClick={() =>
            isCurrentSession
              ? config.navigate(config.routes.signOut)
              : revokeSession(
                  { token: activeSession.token },
                  {
                    onSuccess: () => {
                      toastManager.add({
                        title: "Session revoked",
                        type: "success",
                      })
                    },
                  }
                )
          }
          size="sm"
          variant="outline"
        >
          {actionIcon}
          {actionLabel}
        </Button>
      </CardPanel>
    </Card>
  )
}
