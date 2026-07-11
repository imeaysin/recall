"use client"

import { useAuthUiConfig, useDeleteOrganization } from "@workspace/auth/react"
import type { Organization } from "@workspace/auth/types/organization"
import { TriangleAlert } from "lucide-react"
import type { SubmitEventHandler } from "react"
import { Button } from "@workspace/ui-shadcn/components/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@workspace/ui-shadcn/components/alert-dialog"
import { Spinner } from "@workspace/ui-shadcn/components/spinner"
import { toastManager } from "@workspace/ui-shadcn/components/toast"
import { OrganizationView } from "./organization-view"

export type DeleteOrganizationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: Organization
}

export function DeleteOrganizationDialog({
  open,
  onOpenChange,
  organization,
}: DeleteOrganizationDialogProps) {
  const config = useAuthUiConfig()
  const { mutate: deleteOrganization, isPending } = useDeleteOrganization()

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    deleteOrganization(
      { organizationId: organization.id },
      {
        onSuccess: () => {
          onOpenChange(false)
          toastManager.add({
            title: "Workspace deleted",
            description: "The workspace has been deleted.",
            type: "success",
          })
          config.navigate(config.routes.defaultAuthenticated, { replace: true })
        },
        onError: () => {
          toastManager.add({
            title: "Could not delete workspace",
            description: "Please try again.",
            type: "error",
          })
        },
      }
    )
  }

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <form className="contents" onSubmit={handleSubmit}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete workspace</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div>
            <div className="rounded-lg border bg-muted/30 px-3 py-2.5">
              <OrganizationView organization={organization} />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <Button disabled={isPending} type="submit" variant="destructive">
              {isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <TriangleAlert className="size-4" data-icon="inline-start" />
              )}
              Delete workspace
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
