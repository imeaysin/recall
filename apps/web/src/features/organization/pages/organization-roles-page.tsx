"use client"

import { useActiveOrganization } from "@workspace/auth/react"
import { CreateOrganizationDialog, Organization } from "@workspace/ui/auth"
import { ShellMain } from "@workspace/ui/components/shell"
import { useCreateOrganizationDialog } from "@/features/auth/hooks/use-create-organization-dialog"
import { useOrganizationRoleDialogs } from "@/features/auth/hooks/use-organization-role-dialogs"

export function OrganizationRolesPage() {
  const { data: activeOrganization } = useActiveOrganization()
  const createOrganization = useCreateOrganizationDialog()
  const roleDialogs = useOrganizationRoleDialogs()

  return (
    <ShellMain
      heading="Workspace"
      subtitle="Manage built-in and custom roles for your workspace."
    >
      <CreateOrganizationDialog {...createOrganization.dialogProps} />
      <Organization
        onCreateOrganization={createOrganization.openDialog}
        roles={
          activeOrganization
            ? {
                ...roleDialogs.rolesProps,
              }
            : undefined
        }
        view="roles"
      />
    </ShellMain>
  )
}
