"use client"

import { formatOrganizationRoleLabel } from "@workspace/auth/permissions/organization"
import { useRemoveMember } from "@workspace/auth/react"
import type { OrganizationMember } from "@workspace/auth/types/organization"
import { Badge } from "@workspace/ui-shadcn/components/badge"
import { Button } from "@workspace/ui-shadcn/components/button"
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
import { Spinner } from "@workspace/ui-shadcn/components/spinner"
import { AuthUserView } from "../auth-user-view"

export type RemoveMemberDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: OrganizationMember
}

export function RemoveMemberDialog({
  open,
  onOpenChange,
  member,
}: RemoveMemberDialogProps) {
  const { mutate: removeMember, isPending } = useRemoveMember()

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove member</AlertDialogTitle>
          <AlertDialogDescription>
            This member will lose access to the workspace.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="px-6 pb-2">
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <AuthUserView user={member.user} />
              <Badge variant="outline">
                {formatOrganizationRoleLabel(member.role)}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            disabled={isPending}
            onClick={() =>
              removeMember(
                { memberId: member.id },
                {
                  onSuccess: () => {
                    onOpenChange(false)
                    toast.success("Member removed", {
                      description: "The member has been removed.",
                    })
                  },
                  onError: () => {
                    toast.error("Could not remove member", {
                      description: "Please try again.",
                    })
                  },
                }
              )
            }
            type="button"
            variant="destructive"
          >
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            Remove member
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
