"use client"

import type { OrganizationPermissionMap } from "@workspace/auth/permissions/organization"
import { formatOrganizationRoleLabel } from "@workspace/auth/permissions/organization"
import type { OrganizationRole } from "@workspace/auth/types/organization"
import { Button } from "@workspace/ui/components/button"
import { Pane } from "@workspace/ui/components/pane"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Form } from "@workspace/ui/components/form"
import { Controller, useFormState, type Control } from "react-hook-form"
import { OrganizationRolePermissions } from "./organization-role-permissions"

type EditOrganizationRoleValues = {
  permission: OrganizationPermissionMap
}

export type EditOrganizationRoleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: OrganizationRole | null
  control: Control<EditOrganizationRoleValues>
  onSubmit: () => void
  isPending?: boolean
}

export function EditOrganizationRoleDialog({
  open,
  onOpenChange,
  role,
  control,
  onSubmit,
  isPending = false,
}: EditOrganizationRoleDialogProps) {
  const { errors } = useFormState({ control })

  if (!role) return null

  const formErrors: Record<string, string> = {}
  if (errors.permission?.message) {
    formErrors.permission = errors.permission.message
  }

  return (
    <Pane onOpenChange={onOpenChange} open={open}>
      <Pane.Content>
        <Pane.Header>
          <Pane.Title>Edit role</Pane.Title>
          <Pane.Description>
            Update permissions for {formatOrganizationRoleLabel(role.role)}.
          </Pane.Description>
        </Pane.Header>

        <Form
          className="contents"
          errors={Object.keys(formErrors).length > 0 ? formErrors : undefined}
          onSubmit={onSubmit}
        >
          <Pane.Panel className="flex flex-col gap-4">
            <Controller
              control={control}
              name="permission"
              render={({ field }) => (
                <Field className="gap-3" name="permission">
                  <FieldLabel>Permissions</FieldLabel>
                  <OrganizationRolePermissions
                    disabled={isPending}
                    onChange={field.onChange}
                    permissions={field.value}
                  />
                  <FieldError />
                </Field>
              )}
            />
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
