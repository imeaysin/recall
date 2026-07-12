import { useBanUser, type AdminListedUser } from "@workspace/auth/react"
import type { BanUserDialogProps } from "@workspace/ui-shadcn/auth"
import { useState } from "react"
import { toast } from "@workspace/ui-shadcn/components/sonner"

export function useBanUserDialog() {
  const [open, setOpen] = useState(false)
  const [targetUser, setTargetUser] = useState<AdminListedUser | null>(null)
  const { mutateAsync: banUser } = useBanUser()

  function openForUser(user: AdminListedUser) {
    setTargetUser(user)
    setOpen(true)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setTargetUser(null)
    }
    setOpen(nextOpen)
  }

  const dialogProps: BanUserDialogProps = {
    open,
    onOpenChange: handleOpenChange,
    userLabel: targetUser?.email ?? "This user",
    onSubmit: async (values) => {
      if (!targetUser) return

      const promise = banUser({
        userId: targetUser.id,
        banReason: values.banReason || undefined,
      })
      toast.promise(promise, {
        loading: "Banning user…",
        success: "User banned",
        error: "Could not ban user",
      })
      try {
        await promise
        handleOpenChange(false)
      } catch {
        // handled by toast
      }
    },
  }

  return {
    openForUser,
    dialogProps,
  }
}
