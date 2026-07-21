import { Button } from "@workspace/ui/components/button"
import type { ContentResponse } from "@workspace/contracts"
import { useContentList, useRetryContent } from "../hooks/use-content"

type LibraryListProps = {
  readonly libraryStatus: "QUEUE" | "ARCHIVE"
}

export function LibraryList({ libraryStatus }: LibraryListProps) {
  const list = useContentList(libraryStatus)
  const retry = useRetryContent()
  const items = list.data?.items ?? []

  if (list.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  return (
    <ul className="divide-y divide-border rounded-lg border">
      {items.map((item) => (
        <LibraryListItem
          key={item.id}
          item={item}
          onRetry={() => retry.mutate(item.id)}
          retryPending={retry.isPending}
        />
      ))}
      {items.length === 0 ? (
        <li className="p-4 text-sm text-muted-foreground">
          No items in {libraryStatus === "QUEUE" ? "queue" : "archive"} yet.
        </li>
      ) : null}
    </ul>
  )
}

function LibraryListItem(props: {
  readonly item: ContentResponse
  readonly onRetry: () => void
  readonly retryPending: boolean
}) {
  const { item, onRetry, retryPending } = props
  const heading = item.title ?? item.sourceUrl ?? "Untitled"
  const stepLabel = item.processingStep ? ` / ${item.processingStep}` : ""

  return (
    <li className="flex flex-col gap-1 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{heading}</p>
          <p className="text-xs text-muted-foreground">
            {item.sourceType} · {item.status}
            {stepLabel}
          </p>
        </div>
        {item.status === "FAILED" || item.errorCode ? (
          <Button
            size="sm"
            variant="outline"
            disabled={retryPending}
            onClick={onRetry}
          >
            Retry
          </Button>
        ) : null}
      </div>
      {item.errorMessage ? (
        <p className="text-xs text-destructive">{item.errorMessage}</p>
      ) : null}
      {item.summary ? (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {item.summary}
        </p>
      ) : null}
    </li>
  )
}
