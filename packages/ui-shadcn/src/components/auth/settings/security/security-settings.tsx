"use client"

import { cn } from "@workspace/ui-shadcn/lib/utils"
import type { ChangePasswordProps } from "./change-password"
import { ActiveSessions } from "./active-sessions"
import { ChangePassword } from "./change-password"
import { LinkedAccounts } from "./linked-accounts"

export type SecuritySettingsProps = {
  className?: string
  changePassword?: ChangePasswordProps
}

export function SecuritySettings({
  className,
  changePassword,
}: SecuritySettingsProps) {
  return (
    <div className={cn("flex w-full flex-col gap-4 md:gap-6", className)}>
      <ChangePassword {...changePassword} />
      <LinkedAccounts />
      <ActiveSessions />
    </div>
  )
}
