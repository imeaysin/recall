"use client"

import {
  type OrganizationAuthClient,
  useAuth,
  useAuthPlugin,
  useCancelInvitation,
  useHasPermission,
} from "@better-auth-ui/react"
import type { Invitation } from "better-auth/client"
import { X } from "lucide-react"

import { Badge } from "@workspace/ui-shadcn/components/badge"
import { Button } from "@workspace/ui-shadcn/components/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@workspace/ui-shadcn/components/item"
import { Spinner } from "@workspace/ui-shadcn/components/spinner"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { cn } from "@workspace/ui-shadcn/lib/utils"
import { OrganizationInvitationRowSkeleton } from "@/features/auth/components/organization/organization-invitation-row-skeleton"

export type OrganizationInvitationRowProps = {
  invitation: Invitation
}

const statusBadgeClasses: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  accepted: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-destructive/10 text-destructive",
  canceled: "bg-muted text-muted-foreground",
}

export function OrganizationInvitationRow({
  invitation,
}: OrganizationInvitationRowProps) {
  const { authClient } = useAuth()
  const { localization: organizationLocalization, roles } =
    useAuthPlugin(organizationPlugin)

  const {
    data: cancelInvitationPermission,
    isPending: cancelPermissionPending,
  } = useHasPermission(authClient as OrganizationAuthClient, {
    permissions: { invitation: ["cancel"] },
  })

  const { mutate: cancelInvitation, isPending: cancelPending } =
    useCancelInvitation(authClient as OrganizationAuthClient)

  const roleLabel = roles?.[invitation.role] ?? invitation.role

  const statusLabel =
    organizationLocalization[
      invitation.status as keyof typeof organizationLocalization
    ] ?? invitation.status

  if (cancelPermissionPending) {
    return <OrganizationInvitationRowSkeleton />
  }

  return (
    <Item role="listitem" variant="outline">
      <ItemContent>
        <ItemTitle>{invitation.email}</ItemTitle>
        <ItemDescription className="flex flex-wrap items-center gap-2">
          <span>
            {new Date(invitation.createdAt).toLocaleString(undefined, {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </span>
          <Badge variant="secondary">{roleLabel}</Badge>
          <Badge
            variant="secondary"
            className={cn(statusBadgeClasses[invitation.status])}
          >
            {String(statusLabel)}
          </Badge>
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        {cancelInvitationPermission?.success &&
        invitation.status === "pending" ? (
          <Button
            size="icon-sm"
            variant="outline"
            className="text-destructive"
            disabled={cancelPending}
            onClick={() => cancelInvitation({ invitationId: invitation.id })}
            aria-label={organizationLocalization.cancelInvitation}
          >
            {cancelPending ? <Spinner /> : <X />}
          </Button>
        ) : null}
      </ItemActions>
    </Item>
  )
}
