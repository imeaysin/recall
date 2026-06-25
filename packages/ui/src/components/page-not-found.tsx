import { FileQuestionIcon } from "lucide-react"
import type * as React from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import { cn } from "@workspace/ui/lib/utils"

export interface PageNotFoundProps extends React.ComponentProps<typeof Empty> {
  title?: string
  description?: string
  homeHref?: string
  homeLabel?: string
  action?: React.ReactNode
}

export function PageNotFound({
  title = "Page not found",
  description = "The page you're looking for doesn't exist or may have been moved.",
  homeHref = "/",
  homeLabel = "Go home",
  action,
  className,
  ...props
}: PageNotFoundProps) {
  return (
    <Empty className={cn("min-h-[50vh] flex-1", className)} {...props}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileQuestionIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {action ?? <Button render={<a href={homeHref} />}>{homeLabel}</Button>}
      </EmptyContent>
    </Empty>
  )
}
