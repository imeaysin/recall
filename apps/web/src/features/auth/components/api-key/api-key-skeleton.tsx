"use client"

import {
  Item,
  ItemContent,
  ItemMedia,
} from "@workspace/ui-shadcn/components/item"
import { Skeleton } from "@workspace/ui-shadcn/components/skeleton"

export function ApiKeySkeleton() {
  return (
    <Item>
      <ItemMedia>
        <Skeleton className="size-4 rounded-sm" />
      </ItemMedia>
      <ItemContent>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-3 w-32" />
      </ItemContent>
    </Item>
  )
}
