"use client"

import type { SubmitEventHandler } from "react"
import type { OrganizationPermissionMap } from "@workspace/auth/permissions/organization"
import { Button } from "@workspace/ui/components/button"
import { Pane } from "@workspace/ui/components/pane"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Form } from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"
import { OrganizationRolePermissions } from "./organization-role-permissions"

export interface CreateOrganizationRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: string
  onRoleChange: (value: string) => void
  roleError?: string
  permissions: OrganizationPermissionMap
  onPermissionsChange: (permissions: OrganizationPermissionMap) => void
  permissionError?: string
  onSubmit: SubmitEventHandler<HTMLFormElement>
  isPending?: boolean
}

export function CreateOrganizationRoleDialog({
  open,
  onOpenChange,
  role,
  onRoleChange,
  roleError,
  permissions,
  onPermissionsChange,
  permissionError,
  onSubmit,
  isPending = false,
}: CreateOrganizationRoleDialogProps) {
  return (
    <Pane onOpenChange={onOpenChange} open={open}>
      <Pane.Content className="max-w-lg">
        <Pane.Header>
          <Pane.Title>Create role</Pane.Title>
          <Pane.Description>
            Define a custom role with specific permissions for this workspace.
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
            <Field invalid={Boolean(roleError)}>
              <FieldLabel htmlFor="create-organization-role-name">
                Role name
              </FieldLabel>
              <Input
                autoFocus
                disabled={isPending}
                id="create-organization-role-name"
                onChange={(event) => onRoleChange(event.target.value)}
                placeholder="moderator"
                value={role}
              />
              <FieldError match={Boolean(roleError)}>{roleError}</FieldError>
            </Field>

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
              Create role
            </Button>
          </Pane.Footer>
        </Form>
      </Pane.Content>
    </Pane>
  )
}
