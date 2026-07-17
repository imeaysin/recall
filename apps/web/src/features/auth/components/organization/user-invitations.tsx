"use client"

import {
  type OrganizationAuthClient,
  useAuth,
  useAuthPlugin,
  useListUserInvitations,
} from "@better-auth-ui/react"

import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
} from "@workspace/ui-shadcn/components/item"
import { Skeleton } from "@workspace/ui-shadcn/components/skeleton"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { SectionHeader } from "@/components/page-header"
import { UserInvitationRow } from "@/features/auth/components/organization/user-invitation-row"
import { UserInvitationsEmpty } from "@/features/auth/components/organization/user-invitations-empty"

export type UserInvitationsProps = {
  className?: string
}

/**
 * Organization invitations for the signed-in user.
 */
export function UserInvitations({ className }: UserInvitationsProps) {
  const { authClient } = useAuth()
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  const { data: invitations, isPending } = useListUserInvitations(
    authClient as OrganizationAuthClient
  )

  function renderContent() {
    if (isPending) {
      return (
        <ItemGroup>
          {Array.from({ length: 2 }).map((_, index) => (
            <Item key={index} variant="outline">
              <ItemMedia>
                <Skeleton className="size-4 rounded-sm" />
              </ItemMedia>
              <ItemContent>
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      )
    }

    if (!invitations?.length) {
      return <UserInvitationsEmpty />
    }

    return (
      <ItemGroup>
        {invitations.map((invitation) => (
          <UserInvitationRow key={invitation.id} invitation={invitation} />
        ))}
      </ItemGroup>
    )
  }

  return (
    <div className={className}>
      <div className="flex flex-col gap-3">
        <SectionHeader title={organizationLocalization.invitations} />
        {renderContent()}
      </div>
    </div>
  )
}
