"use client"

import type { SubmitEventHandler } from "react"
import type { OrganizationRole } from "@workspace/auth/types/organization"
import { formatOrganizationRoleLabel } from "@workspace/auth/permissions/organization"
import { TriangleAlert } from "lucide-react"
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
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup>
        <Form
          className="contents"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit(event)
          }}
        >
          <DialogHeader>
            <DialogTitle>Delete role</DialogTitle>
            <DialogDescription>
              Members assigned to this role must be reassigned before it can be
              deleted.
            </DialogDescription>
          </DialogHeader>

          <DialogPanel>
            <div className="rounded-lg border bg-muted/30 px-3 py-2.5 text-sm font-medium">
              {formatOrganizationRoleLabel(role.role)}
            </div>
          </DialogPanel>

          <DialogFooter>
            <DialogClose
              render={
                <Button disabled={isPending} type="button" variant="outline" />
              }
            >
              Cancel
            </DialogClose>
            <Button loading={isPending} type="submit" variant="destructive">
              <TriangleAlert />
              Delete role
            </Button>
          </DialogFooter>
        </Form>
      </DialogPopup>
    </Dialog>
  )
}
