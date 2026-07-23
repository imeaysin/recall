import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import type { ContentResponse } from "@workspace/contracts"
import {
  contentStatusLabel,
  libraryStatusLabel,
} from "@/features/library/domain/content-status-labels"
import { domainFromUrl } from "@/features/library/components/library-card-shared"

export function LibraryContentDetailMeta(props: {
  readonly item: ContentResponse
}) {
  const { item } = props
  const domain = domainFromUrl(item.sourceUrl)

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Details</CardTitle>
        <CardDescription>Source and processing metadata.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <MetaRow label="Status" value={contentStatusLabel(item)} />
          <MetaRow
            label="Library"
            value={libraryStatusLabel(item.libraryStatus)}
          />
          <MetaRow label="Source" value={item.sourceType} />
          <MetaRow label="Domain" value={domain ?? "—"} />
          <MetaRow label="Language" value={item.language ?? "—"} />
          <MetaRow
            label="Words"
            value={item.wordCount !== undefined ? String(item.wordCount) : "—"}
          />
          <MetaRow label="Retries" value={String(item.retryCount)} />
          <MetaRow label="Updated" value={formatDate(item.updatedAt)} />
          <MetaRow label="Created" value={formatDate(item.createdAt)} />
          {item.possibleDuplicateOfContentId ? (
            <MetaRow
              label="Possible duplicate of"
              value={item.possibleDuplicateOfContentId}
            />
          ) : null}
        </dl>
      </CardContent>
    </Card>
  )
}

function MetaRow(props: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-muted-foreground">{props.label}</dt>
      <dd className="truncate font-medium">{props.value}</dd>
    </div>
  )
}

function formatDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString()
}
