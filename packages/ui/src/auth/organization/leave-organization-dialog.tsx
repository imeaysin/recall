"use client"

import { useAuthUiConfig, useLeaveOrganization } from "@workspace/auth/react"
import type { Organization } from "@workspace/auth/types/organization"
import { LogOut } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Pane } from "@workspace/ui/components/pane"
import { toastManager } from "@workspace/ui/components/toast"
import { OrganizationView } from "./organization-view"

export type LeaveOrganizationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: Organization
}

export function LeaveOrganizationDialog({
  open,
  onOpenChange,
  organization,
}: LeaveOrganizationDialogProps) {
  const config = useAuthUiConfig()
  const { mutate: leaveOrganization, isPending } = useLeaveOrganization()

  return (
    <Pane onOpenChange={onOpenChange} open={open}>
      <Pane.Content>
        <Pane.Header>
          <Pane.Title>Leave workspace</Pane.Title>
          <Pane.Description>
            You will lose access to this workspace and its resources.
          </Pane.Description>
        </Pane.Header>

        <Pane.Panel>
          <div className="rounded-lg border bg-muted/30 px-3 py-2.5">
            <OrganizationView organization={organization} />
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
          <Button
            loading={isPending}
            onClick={() =>
              leaveOrganization(
                { organizationId: organization.id },
                {
                  onSuccess: () => {
                    onOpenChange(false)
                    toastManager.add({
                      title: "Left workspace",
                      description: "You have left the workspace.",
                      type: "success",
                    })
                    config.navigate(config.routes.defaultAuthenticated, {
                      replace: true,
                    })
                  },
                  onError: () => {
                    toastManager.add({
                      title: "Could not leave workspace",
                      description: "Please try again.",
                      type: "error",
                    })
                  },
                }
              )
            }
            type="button"
            variant="destructive"
          >
            <LogOut />
            Leave workspace
          </Button>
        </Pane.Footer>
      </Pane.Content>
    </Pane>
  )
}
