"use client"

import type { SubmitEventHandler } from "react"
import type { OrganizationRole } from "@workspace/auth/types/organization"
import { formatOrganizationRoleLabel } from "@workspace/auth/permissions/organization"
import { TriangleAlert } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Pane } from "@workspace/ui/components/pane"
import { Form } from "@workspace/ui/components/form"

export interface DeleteOrganizationRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: OrganizationRole | null
  onSubmit: SubmitEventHandler<HTMLFormElement>
  isPending?: boolean
}

export function DeleteOrganizationRoleDialog({
  open,
  onOpenChange,
  role,
  onSubmit,
  isPending = false,
}: DeleteOrganizationRoleDialogProps) {
  if (!role) return null

  return (
    <Pane onOpenChange={onOpenChange} open={open}>
      <Pane.Content>
        <Form
          className="contents"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit(event)
          }}
        >
          <Pane.Header>
            <Pane.Title>Delete role</Pane.Title>
            <Pane.Description>
              Members assigned to this role must be reassigned before it can be
              deleted.
            </Pane.Description>
          </Pane.Header>

          <Pane.Panel>
            <div className="rounded-lg border bg-muted/30 px-3 py-2.5 text-sm font-medium">
              {formatOrganizationRoleLabel(role.role)}
            </div>
          </Pane.Panel>

          <Pane.Footer>
            <Pane.Close
              render={
                <Button disabled={isPending} type="button" variant="outline" />
              }
            >
              Cancel
            </Pane.Close>
            <Button loading={isPending} type="submit" variant="destructive">
              <TriangleAlert />
              Delete role
            </Button>
          </Pane.Footer>
        </Form>
      </Pane.Content>
    </Pane>
  )
}
