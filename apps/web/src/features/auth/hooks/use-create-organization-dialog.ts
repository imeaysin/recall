import { useCreateOrganization } from "@workspace/auth/react"
import type { CreateOrganizationDialogProps } from "@workspace/ui-shadcn/auth"
import { useCallback, useState } from "react"
import { toast } from "@workspace/ui-shadcn/components/sonner"

export function useCreateOrganizationDialog() {
  const [open, setOpen] = useState(false)
  const { mutateAsync: createOrganization } = useCreateOrganization()

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen)
  }, [])

  const dialogProps: CreateOrganizationDialogProps = {
    open,
    onOpenChange: handleOpenChange,
    onSubmit: async (values) => {
      const promise = createOrganization(values)
      toast.promise(promise, {
        loading: "Creating workspace…",
        success: "Workspace created",
        error: "Could not create workspace",
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
