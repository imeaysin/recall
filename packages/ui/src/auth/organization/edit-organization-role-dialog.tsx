"use client"

import type { SubmitEventHandler } from "react"
import type {
  OrganizationPermissionMap,
  OrganizationRole,
} from "@workspace/auth/react"
import { formatOrganizationRoleLabel } from "@workspace/auth/react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Form } from "@workspace/ui/components/form"
import { OrganizationRolePermissions } from "./organization-role-permissions"

export interface EditOrganizationRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: OrganizationRole | null
  permissions: OrganizationPermissionMap
  onPermissionsChange: (permissions: OrganizationPermissionMap) => void
  permissionError?: string
  onSubmit: SubmitEventHandler<HTMLFormElement>
  isPending?: boolean
}

export function EditOrganizationRoleDialog({
  open,
  onOpenChange,
  role,
  permissions,
  onPermissionsChange,
  permissionError,
  onSubmit,
  isPending = false,
}: EditOrganizationRoleDialogProps) {
  if (!role) return null

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit role</DialogTitle>
          <DialogDescription>
            Update permissions for {formatOrganizationRoleLabel(role.role)}.
          </DialogDescription>
        </DialogHeader>

        <Form
          className="contents"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit(event)
          }}
        >
          <DialogPanel className="flex flex-col gap-4">
            <Field data-invalid={!!permissionError}>
              <FieldLabel>Permissions</FieldLabel>
              <OrganizationRolePermissions
                disabled={isPending}
                onChange={onPermissionsChange}
                permissions={permissions}
              />
              <FieldError>{permissionError}</FieldError>
            </Field>
          </DialogPanel>

          <DialogFooter>
            <DialogClose
              render={
                <Button disabled={isPending} type="button" variant="outline" />
              }
            >
              Cancel
            </DialogClose>
            <Button loading={isPending} type="submit">
              Save changes
            </Button>
          </DialogFooter>
        </Form>
      </DialogPopup>
    </Dialog>
  )
}
