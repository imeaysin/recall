import type * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { Spinner } from "@workspace/ui/components/spinner"

export interface PageLoadingProps extends React.ComponentProps<"div"> {
  message?: string
}

export function PageLoading({
  message,
  className,
  ...props
}: PageLoadingProps) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "flex min-h-[50vh] flex-1 flex-col items-center justify-center gap-3",
        className
      )}
      role="status"
      {...props}
    >
      <Spinner className="size-8 text-muted-foreground" />
      {message ? (
        <p className="text-sm text-muted-foreground">{message}</p>
      ) : null}
    </div>
  )
}
