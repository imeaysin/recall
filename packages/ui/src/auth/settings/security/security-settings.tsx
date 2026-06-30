"use client"

import { cn } from "@workspace/ui/lib/utils"
import { ActiveSessions } from "./active-sessions"
import { ChangePassword } from "./change-password"
import { LinkedAccounts } from "./linked-accounts"

export interface SecuritySettingsProps {
  className?: string
}

export function SecuritySettings({ className }: SecuritySettingsProps) {
  return (
    <div className={cn("flex w-full flex-col gap-4 md:gap-6", className)}>
      <ChangePassword />
      <LinkedAccounts />
      <ActiveSessions />
    </div>
  )
}
