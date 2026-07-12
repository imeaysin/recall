"use client"

import { useAuthUiConfig, useLeaveOrganization } from "@workspace/auth/react"
import type { Organization } from "@workspace/auth/types/organization"
import { LogOut } from "lucide-react"
import { Button } from "@workspace/ui-shadcn/components/button"
import { Spinner } from "@workspace/ui-shadcn/components/spinner"
import { Card, CardContent } from "@workspace/ui-shadcn/components/card"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@workspace/ui-shadcn/components/alert-dialog"
import { toast } from "@workspace/ui-shadcn/components/sonner"
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
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave workspace</AlertDialogTitle>
          <AlertDialogDescription>
            You will lose access to this workspace and its resources.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="px-6 pb-2">
          <Card>
            <CardContent className="p-4">
              <OrganizationView organization={organization} />
            </CardContent>
          </Card>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            disabled={isPending}
            onClick={() =>
              leaveOrganization(
                { organizationId: organization.id },
                {
                  onSuccess: () => {
                    onOpenChange(false)
                    toast.success("Left workspace", {
                      description: "You have left the workspace.",
                    })
                    config.navigate(config.routes.defaultAuthenticated, {
                      replace: true,
                    })
                  },
                  onError: () => {
                    toast.error("Could not leave workspace", {
                      description: "Please try again.",
                    })
                  },
                }
              )
            }
            type="button"
            variant="destructive"
          >
            {isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <LogOut className="size-4" data-icon="inline-start" />
            )}
            Leave workspace
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
