"use client"

import { useActiveOrganization } from "@workspace/auth/react"
import { CreateOrganizationDialog, Organization } from "@workspace/ui/auth"
import { ShellMain } from "@workspace/ui/components/shell"
import { useCreateOrganizationDialog } from "@/features/auth/hooks/use-create-organization-dialog"
import { useOrganizationProfileForm } from "@/features/auth/hooks/use-organization-profile-form"

const emptyOrganization = {
  id: "",
  name: "",
  slug: "",
  createdAt: new Date(),
}

export function OrganizationSettingsPage() {
  const { data: activeOrganization } = useActiveOrganization()
  const createOrganization = useCreateOrganizationDialog()
  const organization = activeOrganization ?? emptyOrganization
  const profile = useOrganizationProfileForm(organization)

  return (
    <ShellMain
      heading="Workspace"
      subtitle="Manage your workspace settings and members."
    >
      <CreateOrganizationDialog {...createOrganization.dialogProps} />
      <Organization
        onCreateOrganization={createOrganization.openDialog}
        settings={activeOrganization ? { profile } : undefined}
        view="settings"
      />
    </ShellMain>
  )
}
