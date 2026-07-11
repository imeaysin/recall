"use client"

import { formatOrganizationRoleLabel } from "@workspace/auth/permissions/organization"
import type { OrganizationRole } from "@workspace/auth/types/organization"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui-shadcn/components/alert-dialog"
import { Button } from "@workspace/ui-shadcn/components/button"
import { Spinner } from "@workspace/ui-shadcn/components/spinner"

export type ConfirmDeleteOrganizationRoleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: OrganizationRole | null
  onSubmit: () => void
  isPending?: boolean
}

export function ConfirmDeleteOrganizationRoleDialog({
  open,
  onOpenChange,
  role,
  onSubmit,
  isPending = false,
}: ConfirmDeleteOrganizationRoleDialogProps) {
  if (!role) return null

  const roleLabel = formatOrganizationRoleLabel(role.role)

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete role?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">{roleLabel}</span>{" "}
            will be permanently deleted. Reassign members on this role before
            deleting.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault()
              onSubmit()
            }}
            variant="destructive"
          >
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            Delete role
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
