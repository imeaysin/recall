"use client"

import { Settings } from "@workspace/ui/auth"
import { ShellMain } from "@workspace/ui/components/shell"

export function SecuritySettingsPage() {
  return (
    <ShellMain
      heading="Security"
      subtitle="Manage your password, linked accounts, and sessions."
    >
      <Settings view="security" />
    </ShellMain>
  )
}
