import type * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { Skeleton } from "@workspace/ui/components/skeleton"

export interface ContentSkeletonProps extends React.ComponentProps<"div"> {
  rows?: number
}

export function ContentSkeleton({
  rows = 3,
  className,
  ...props
}: ContentSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      {Array.from({ length: rows }).map((_, index) => (
        <div className="flex items-center gap-3" key={index}>
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
