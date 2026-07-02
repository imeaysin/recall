"use client"

import type { SubmitEventHandler } from "react"
import type { OrganizationPermissionMap } from "@workspace/auth/permissions/organization"
import { formatOrganizationRoleLabel } from "@workspace/auth/permissions/organization"
import type { OrganizationRole } from "@workspace/auth/types/organization"
import { Button } from "@workspace/ui/components/button"
import { Pane } from "@workspace/ui/components/pane"
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
    <Pane onOpenChange={onOpenChange} open={open}>
      <Pane.Content className="max-w-lg">
        <Pane.Header>
          <Pane.Title>Edit role</Pane.Title>
          <Pane.Description>
            Update permissions for {formatOrganizationRoleLabel(role.role)}.
          </Pane.Description>
        </Pane.Header>

        <Form
          className="contents"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit(event)
          }}
        >
          <Pane.Panel className="flex flex-col gap-4">
            <Field invalid={Boolean(permissionError)}>
              <FieldLabel>Permissions</FieldLabel>
              <OrganizationRolePermissions
                disabled={isPending}
                onChange={onPermissionsChange}
                permissions={permissions}
              />
              <FieldError match={Boolean(permissionError)}>
                {permissionError}
              </FieldError>
            </Field>
          </Pane.Panel>

          <Pane.Footer>
            <Pane.Close
              render={
                <Button disabled={isPending} type="button" variant="outline" />
              }
            >
              Cancel
            </Pane.Close>
            <Button loading={isPending} type="submit">
              Save changes
            </Button>
          </Pane.Footer>
        </Form>
      </Pane.Content>
    </Pane>
  )
}
