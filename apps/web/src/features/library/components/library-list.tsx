import { useState } from "react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@workspace/ui/components/item"
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
  const list = useContentList({ libraryStatus })
  const items = list.data?.items ?? []

  return (
    <ItemGroup>
      {items.map((item) => (
        <LibraryListItem key={item.id} item={item} />
      ))}
    </ItemGroup>
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

  const stepLabel = item.processingStep ? ` · ${item.processingStep}` : ""
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

  if (editing) {
    return (
      <Item variant="outline">
        <ItemContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`title-${item.id}`}>Title</FieldLabel>
              <Input
                id={`title-${item.id}`}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`summary-${item.id}`}>Summary</FieldLabel>
              <Input
                id={`summary-${item.id}`}
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
              />
            </Field>
            <ItemActions>
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
            </ItemActions>
          </FieldGroup>
        </ItemContent>
      </Item>
    )
  }

  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>{item.title ?? item.sourceUrl ?? "Untitled"}</ItemTitle>
        <ItemDescription>
          <span className="inline-flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{item.sourceType}</Badge>
            <Badge variant="outline">
              {item.status}
              {stepLabel}
            </Badge>
          </span>
        </ItemDescription>
        {item.summary ? (
          <ItemDescription>{item.summary}</ItemDescription>
        ) : null}
        {errorLabel || item.errorMessage ? (
          <Alert variant="destructive">
            <AlertDescription>
              {errorLabel ?? item.errorMessage}
            </AlertDescription>
          </Alert>
        ) : null}
      </ItemContent>
      <ItemActions>
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
        {item.status === "FAILED" || item.errorCode ? (
          <Button
            size="sm"
            variant="outline"
            disabled={actionPending}
            onClick={() => retry.mutate(item.id)}
          >
            Retry
          </Button>
        ) : null}
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
      </ItemActions>
    </Item>
  )
}
