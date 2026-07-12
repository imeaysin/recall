import {
  useCreateAdminUser,
  usePlatformRoleOptions,
} from "@workspace/auth/react"
import type { CreateUserDialogProps } from "@workspace/ui-shadcn/auth"
import { createAdminUserSchema } from "@workspace/auth/forms"
import { useState } from "react"
import { toast } from "@workspace/ui-shadcn/components/sonner"

export function useCreateUserDialog() {
  const [open, setOpen] = useState(false)
  const { roles, formatPlatformRoleLabel } = usePlatformRoleOptions()
  const { mutateAsync: createUser } = useCreateAdminUser()

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
  }

  const dialogProps: CreateUserDialogProps = {
    open,
    onOpenChange: handleOpenChange,
    roles,
    formatRoleLabel: formatPlatformRoleLabel,
    onSubmit: async (values) => {
      const parsedValues = createAdminUserSchema.parse(values)
      const promise = createUser(parsedValues)
      toast.promise(promise, {
        loading: "Creating user…",
        success: "User created",
        error: "Could not create user",
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
