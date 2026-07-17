"use client"

import {
  Item,
  ItemActions,
  ItemContent,
} from "@workspace/ui-shadcn/components/item"
import { Skeleton } from "@workspace/ui-shadcn/components/skeleton"

/**
 * Placeholder row matching `OrganizationInvitationRow` while invitations load.
 */
export function OrganizationInvitationRowSkeleton() {
  return (
    <Item variant="outline">
      <ItemContent>
        <Skeleton className="h-4 w-48 rounded-md" />
        <Skeleton className="h-3 w-36 rounded-md" />
      </ItemContent>
      <ItemActions>
        <Skeleton className="size-8 rounded-md" />
      </ItemActions>
    </Item>
  )
}
