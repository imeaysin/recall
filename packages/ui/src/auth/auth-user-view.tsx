"use client"

import type { ReactNode } from "react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"
import { AuthUserAvatar, type AuthUserAvatarUser } from "./auth-user-avatar"

export interface AuthUserViewProps {
  user?: AuthUserAvatarUser | null
  loading?: boolean
  primaryLabel?: ReactNode
  secondaryLabel?: ReactNode
  className?: string
}

export function AuthUserView({
  user,
  loading = false,
  primaryLabel,
  secondaryLabel,
  className,
}: AuthUserViewProps) {
  const primary =
    primaryLabel ?? user?.displayUsername ?? user?.name ?? user?.email
  const secondary = secondaryLabel ?? (user?.name ? user.email : undefined)

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <AuthUserAvatar loading={loading} user={user} />
      <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
        {loading && !user ? (
          <>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-1 h-3 w-32" />
          </>
        ) : (
          <>
            {primary ? (
              <span className="truncate font-medium text-foreground">
                {primary}
              </span>
            ) : null}
            {secondary ? (
              <span className="truncate text-xs text-muted-foreground">
                {secondary}
              </span>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
