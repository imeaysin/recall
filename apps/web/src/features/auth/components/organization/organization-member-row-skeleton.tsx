"use client"

import {
  Item,
  ItemActions,
  ItemContent,
} from "@workspace/ui-shadcn/components/item"
import { Skeleton } from "@workspace/ui-shadcn/components/skeleton"
import { UserView } from "@/features/auth/components/user/user-view"

/**
 * Placeholder row matching `OrganizationMemberRow` while members load.
 */
export function OrganizationMemberRowSkeleton() {
  return (
    <Item variant="outline">
      <ItemContent className="gap-2">
        <UserView isPending />
        <Skeleton className="h-4 w-18 rounded-md" />
      </ItemContent>
      <ItemActions>
        <Skeleton className="size-8 rounded-md" />
      </ItemActions>
    </Item>
  )
}
