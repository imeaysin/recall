"use client"

import {
  type OrganizationAuthClient,
  useAuth,
  useAuthPlugin,
  useListOrganizations,
} from "@better-auth-ui/react"
import { useState } from "react"

import { Button } from "@workspace/ui-shadcn/components/button"
import {
  Item,
  ItemContent,
  ItemGroup,
} from "@workspace/ui-shadcn/components/item"
import { Skeleton } from "@workspace/ui-shadcn/components/skeleton"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { SectionHeader } from "@/components/page-header"
import { CreateOrganizationDialog } from "@/features/auth/components/organization/create-organization-dialog"
import { OrganizationRow } from "@/features/auth/components/organization/organization-row"
import { OrganizationsEmpty } from "@/features/auth/components/organization/organizations-empty"

export type OrganizationsProps = {
  className?: string
  /** When true, omit the section header (page already provides PageHeader). */
  hideHeader?: boolean
  createOpen?: boolean
  onCreateOpenChange?: (open: boolean) => void
}

/**
 * Lists organizations the user belongs to (via `useListOrganizations`): loading skeleton,
 * empty state with create, or Item rows with a Manage control per organization.
 */
export function Organizations({
  className,
  hideHeader,
  createOpen: createOpenProp,
  onCreateOpenChange,
}: OrganizationsProps) {
  const { authClient } = useAuth()
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  const [uncontrolledCreateOpen, setUncontrolledCreateOpen] = useState(false)
  const createOpen = createOpenProp ?? uncontrolledCreateOpen
  const setCreateOpen = onCreateOpenChange ?? setUncontrolledCreateOpen

  const { data: organizations, isPending: organizationsPending } =
    useListOrganizations(authClient as OrganizationAuthClient)

  function renderContent() {
    if (organizationsPending) {
      return (
        <ItemGroup>
          {Array.from({ length: 2 }).map((_, index) => (
            <Item key={index} variant="outline">
              <ItemContent>
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      )
    }

    if (!organizations?.length) {
      return <OrganizationsEmpty onCreatePress={() => setCreateOpen(true)} />
    }

    return (
      <ItemGroup>
        {organizations.map((organization) => (
          <OrganizationRow key={organization.id} organization={organization} />
        ))}
      </ItemGroup>
    )
  }

  return (
    <>
      <div className={className}>
        <div className="flex flex-col gap-3">
          {!hideHeader ? (
            <SectionHeader
              actions={
                <Button
                  size="sm"
                  disabled={organizationsPending}
                  onClick={() => setCreateOpen(true)}
                >
                  {organizationLocalization.createOrganization}
                </Button>
              }
              title={organizationLocalization.organizations}
            />
          ) : null}

          {renderContent()}
        </div>
      </div>

      <CreateOrganizationDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </>
  )
}
