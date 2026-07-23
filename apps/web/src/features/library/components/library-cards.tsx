import type { ReactNode } from "react"
import { AspectRatio } from "@workspace/ui/components/aspect-ratio"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import type { ContentResponse } from "@workspace/contracts"
import {
  LIBRARY_CARD_CLASS,
  LIBRARY_CARD_GRID_CLASS,
  LIBRARY_CARD_MEDIA_RATIO,
} from "@/features/library/components/library-card-shared"
import { LibraryContentCard } from "@/features/library/components/library-content-card"

export type {
  LibraryDateFilter,
  LibrarySourceFilter,
} from "@/features/library/components/library-card-shared"

export { filterLibraryItems } from "@/features/library/components/library-card-shared"

export { LibraryToolbar } from "@/features/library/components/library-toolbar"
export { QuickAddCard } from "@/features/library/components/library-quick-add-card"
export { LibraryContentCard } from "@/features/library/components/library-content-card"

export function LibraryDaySection({
  label,
  items,
  leading,
}: {
  readonly label: string
  readonly items: readonly ContentResponse[]
  readonly leading?: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold tracking-tight">{label}</h2>
      <div className={LIBRARY_CARD_GRID_CLASS}>
        {leading}
        {items.map((item) => (
          <LibraryContentCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

export function LibraryCardSkeletonGrid() {
  return (
    <div className={LIBRARY_CARD_GRID_CLASS}>
      <LibraryCardSkeleton />
      <LibraryCardSkeleton />
      <LibraryCardSkeleton />
    </div>
  )
}

function LibraryCardSkeleton() {
  return (
    <Card size="sm" className={LIBRARY_CARD_CLASS}>
      <CardContent>
        <AspectRatio
          ratio={LIBRARY_CARD_MEDIA_RATIO}
          className="overflow-hidden rounded-lg"
        >
          <Skeleton className="size-full rounded-lg" />
        </AspectRatio>
      </CardContent>
      <CardHeader className="gap-2">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardFooter className="min-w-0 border-0 bg-transparent">
        <Skeleton className="h-5 w-16 rounded-full" />
      </CardFooter>
    </Card>
  )
}
