import { useEffect, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import type { ContentResponse } from "@workspace/contracts"
import { useUpdateContent } from "@/features/library/hooks/use-content"

export function LibraryContentDetailSummary(props: {
  readonly item: ContentResponse
}) {
  const { item } = props
  const update = useUpdateContent()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(item.title ?? "")
  const [summary, setSummary] = useState(item.summary ?? "")

  useEffect(() => {
    if (editing) return
    setTitle(item.title ?? "")
    setSummary(item.summary ?? "")
  }, [item.title, item.summary, editing])

  function save() {
    const body: { title?: string; summary?: string } = {}
    const nextTitle = title.trim()
    const nextSummary = summary.trim()
    if (nextTitle && nextTitle !== (item.title ?? "")) body.title = nextTitle
    if (nextSummary && nextSummary !== (item.summary ?? "")) {
      body.summary = nextSummary
    }
    if (Object.keys(body).length === 0) {
      setEditing(false)
      return
    }
    update.mutate({ id: item.id, body }, { onSuccess: () => setEditing(false) })
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Summary</CardTitle>
        <CardDescription>
          AI-generated title and summary. Edits are kept on re-processing unless
          you regenerate.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {editing ? (
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`detail-title-${item.id}`}>Title</FieldLabel>
              <Input
                id={`detail-title-${item.id}`}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={update.isPending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`detail-summary-${item.id}`}>
                Summary
              </FieldLabel>
              <Textarea
                id={`detail-summary-${item.id}`}
                value={summary}
                rows={6}
                onChange={(event) => setSummary(event.target.value)}
                disabled={update.isPending}
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                disabled={update.isPending}
                onClick={save}
              >
                Save
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={update.isPending}
                onClick={() => {
                  setTitle(item.title ?? "")
                  setSummary(item.summary ?? "")
                  setEditing(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </FieldGroup>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">
                {item.title ?? "Untitled"}
                {item.titleEditedByUser ? (
                  <span className="ms-2 text-muted-foreground">(edited)</span>
                ) : null}
              </p>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                {item.summary?.trim()
                  ? item.summary
                  : "No summary yet. Waiting for processing or regenerate."}
                {item.summaryEditedByUser ? (
                  <span className="ms-2">(edited)</span>
                ) : null}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-fit"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
