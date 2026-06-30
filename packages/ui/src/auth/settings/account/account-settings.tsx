"use client"

import type { ComponentProps } from "react"
import { cn } from "@workspace/ui/lib/utils"
import { ChangeEmail } from "./change-email"
import { UserProfile } from "./user-profile"

export interface AccountSettingsProps {
  className?: string
}

export function AccountSettings({
  className,
  ...props
}: AccountSettingsProps & ComponentProps<"div">) {
  return (
    <div
      className={cn("flex w-full flex-col gap-4 md:gap-6", className)}
      {...props}
    >
      <UserProfile />
      <ChangeEmail />
    </div>
  )
}
