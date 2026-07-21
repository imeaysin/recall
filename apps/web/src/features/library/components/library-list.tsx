import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import type { ContentResponse } from "@workspace/contracts"
import { contentErrorLabel } from "../domain/content-error-labels"
import {
  useContentList,
  useRegenerateContent,
  useRetryContent,
  useSoftDeleteContent,
  useUpdateContent,
} from "../hooks/use-content"

type LibraryListProps = {
  readonly libraryStatus: "QUEUE" | "ARCHIVE"
}

export function LibraryList({ libraryStatus }: LibraryListProps) {
  const list = useContentList(libraryStatus)
  const items = list.data?.items ?? []

  if (list.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  return (
    <ul className="divide-y divide-border rounded-lg border">
      {items.map((item) => (
        <LibraryListItem key={item.id} item={item} />
      ))}
      {items.length === 0 ? (
        <li className="p-4 text-sm text-muted-foreground">
          No items in {libraryStatus === "QUEUE" ? "queue" : "archive"} yet.
        </li>
      ) : null}
    </ul>
  )
}

function LibraryListItem(props: { readonly item: ContentResponse }) {
  const { item } = props
  const retry = useRetryContent()
  const update = useUpdateContent()
  const softDelete = useSoftDeleteContent()
  const regenerate = useRegenerateContent()

  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(item.title ?? "")
  const [summary, setSummary] = useState(item.summary ?? "")

  const stepLabel = item.processingStep ? ` / ${item.processingStep}` : ""
  const errorLabel = contentErrorLabel(item.errorCode)
  const nextLibraryStatus = item.libraryStatus === "QUEUE" ? "ARCHIVE" : "QUEUE"

  function saveEdits() {
    const body: { title?: string; summary?: string } = {}
    const trimmedTitle = title.trim()
    const trimmedSummary = summary.trim()
    if (trimmedTitle && trimmedTitle !== (item.title ?? "")) {
      body.title = trimmedTitle
    }
    if (trimmedSummary && trimmedSummary !== (item.summary ?? "")) {
      body.summary = trimmedSummary
    }
    if (Object.keys(body).length === 0) {
      setEditing(false)
      return
    }
    update.mutate({ id: item.id, body }, { onSuccess: () => setEditing(false) })
  }

  const actionPending =
    retry.isPending ||
    update.isPending ||
    softDelete.isPending ||
    regenerate.isPending

  return (
    <li className="flex flex-col gap-2 p-4">
      {editing ? (
        <div className="flex flex-col gap-2">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title"
          />
          <Input
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="Summary"
          />
          <div className="flex gap-2">
            <Button size="sm" disabled={update.isPending} onClick={saveEdits}>
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setTitle(item.title ?? "")
                setSummary(item.summary ?? "")
                setEditing(false)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-medium">
              {item.title ?? item.sourceUrl ?? "Untitled"}
            </p>
            <p className="text-xs text-muted-foreground">
              {item.sourceType} · {item.status}
              {stepLabel}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-1">
            <Button
              size="sm"
              variant="ghost"
              disabled={actionPending}
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={actionPending}
              onClick={() =>
                update.mutate({
                  id: item.id,
                  body: { libraryStatus: nextLibraryStatus },
                })
              }
            >
              {nextLibraryStatus === "ARCHIVE" ? "Archive" : "Queue"}
            </Button>
            {item.status === "COMPLETED" ? (
              <Button
                size="sm"
                variant="outline"
                disabled={actionPending}
                onClick={() => regenerate.mutate({ id: item.id })}
              >
                Regenerate
              </Button>
            ) : null}
            {(item.status === "FAILED" || item.errorCode) && (
              <Button
                size="sm"
                variant="outline"
                disabled={actionPending}
                onClick={() => retry.mutate(item.id)}
              >
                Retry
              </Button>
            )}
            <Button
              size="sm"
              variant="destructive"
              disabled={actionPending}
              onClick={() => {
                if (
                  window.confirm(
                    "Move this item to trash? You can restore it within the retention period."
                  )
                ) {
                  softDelete.mutate(item.id)
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      )}

      {errorLabel ? (
        <p className="text-xs text-destructive">{errorLabel}</p>
      ) : null}
      {item.errorMessage && !errorLabel ? (
        <p className="text-xs text-destructive">{item.errorMessage}</p>
      ) : null}
      {!editing && item.summary ? (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {item.summary}
        </p>
      ) : null}
    </li>
  )
}
