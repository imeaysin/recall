import {
  useAssignableOrganizationRoles,
  useInviteMember,
} from "@workspace/auth/react"
import type { InviteMemberDialogProps } from "@workspace/ui-shadcn/auth"
import { useState } from "react"
import { toast } from "@workspace/ui-shadcn/components/sonner"

export function useInviteMemberDialog() {
  const [open, setOpen] = useState(false)
  const { roles, formatOrganizationRoleLabel } = useAssignableOrganizationRoles(
    undefined,
    { enabled: open }
  )
  const { mutateAsync: inviteMember } = useInviteMember()

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
  }

  const dialogProps: InviteMemberDialogProps = {
    open,
    onOpenChange: handleOpenChange,
    roles,
    formatRoleLabel: formatOrganizationRoleLabel,
    onSubmit: async (values) => {
      const promise = inviteMember(values)
      toast.promise(promise, {
        loading: "Sending invitation…",
        success: "Invitation sent",
        error: "Could not send invitation",
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
    open,
    openDialog: () => setOpen(true),
    dialogProps,
  }
}
