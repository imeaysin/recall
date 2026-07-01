"use client"

import { useActiveOrganization } from "@workspace/auth/react"
import { CreateOrganizationDialog, Organization } from "@workspace/ui/auth"
import { ShellMain } from "@workspace/ui/components/shell"
import { useCreateOrganizationDialog } from "@/features/auth/hooks/use-create-organization-dialog"
import { useInviteMemberDialog } from "@/features/auth/hooks/use-invite-member-dialog"

export function OrganizationPeoplePage() {
  const { data: activeOrganization } = useActiveOrganization()
  const createOrganization = useCreateOrganizationDialog()
  const inviteMember = useInviteMemberDialog()

  return (
    <ShellMain
      heading="Workspace"
      subtitle="Manage your workspace settings and members."
    >
      <CreateOrganizationDialog {...createOrganization.dialogProps} />
      <Organization
        onCreateOrganization={createOrganization.openDialog}
        people={
          activeOrganization
            ? {
                members: {
                  inviteDialog: inviteMember.dialogProps,
                  onInviteClick: inviteMember.openDialog,
                },
              }
            : undefined
        }
        view="people"
      />
    </ShellMain>
  )
}
