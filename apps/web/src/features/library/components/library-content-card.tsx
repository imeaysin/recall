import { GlobeIcon } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import type { ContentResponse } from "@workspace/contracts"
import { LibraryCardActionsMenu } from "@/features/library/components/library-card-actions-menu"
import { LibraryCardMedia } from "@/features/library/components/library-card-media"
import {
  coverImageUrl,
  domainFromUrl,
  faviconUrl,
  LIBRARY_CARD_CLASS,
  LIBRARY_CARD_TITLE_CLASS,
} from "@/features/library/components/library-card-shared"
import {
  useRegenerateContent,
  useRetryContent,
  useSoftDeleteContent,
  useUpdateContent,
} from "@/features/library/hooks/use-content"

export function LibraryContentCard({
  item,
}: {
  readonly item: ContentResponse
}) {
  const update = useUpdateContent()
  const softDelete = useSoftDeleteContent()
  const regenerate = useRegenerateContent()
  const retry = useRetryContent()

  const title = item.title ?? item.sourceUrl ?? "Untitled"
  const domain = domainFromUrl(item.sourceUrl)
  const topicName = item.topicSnapshot[0]?.name
  const nextStatus = item.libraryStatus === "QUEUE" ? "ARCHIVE" : "QUEUE"
  const isPending =
    update.isPending ||
    softDelete.isPending ||
    regenerate.isPending ||
    retry.isPending

  return (
    <Card size="sm" className={LIBRARY_CARD_CLASS}>
      <CardContent>
        <LibraryCardMedia src={coverImageUrl(item)} alt={title} />
      </CardContent>
      <CardHeader>
        <CardTitle className={LIBRARY_CARD_TITLE_CLASS}>{title}</CardTitle>
        <CardDescription className="flex min-w-0 items-center gap-2 tracking-wide uppercase">
          <SourceMark domain={domain} />
          <span className="truncate">
            {domain?.toUpperCase() ?? item.sourceType}
          </span>
        </CardDescription>
        <CardAction>
          <LibraryCardActionsMenu
            isPending={isPending}
            nextStatus={nextStatus}
            status={item.status}
            hasError={Boolean(item.errorCode) || item.status === "FAILED"}
            onArchiveToggle={() =>
              update.mutate({
                id: item.id,
                body: { libraryStatus: nextStatus },
              })
            }
            onRegenerate={() => regenerate.mutate({ id: item.id })}
            onRetry={() => retry.mutate(item.id)}
            onDelete={() => confirmDelete(item.id, softDelete.mutate)}
          />
        </CardAction>
      </CardHeader>
      <CardFooter className="min-w-0 border-0 bg-transparent">
        {topicName ? (
          <Badge variant="secondary" className="max-w-full truncate">
            {topicName}
          </Badge>
        ) : (
          <span className="truncate text-muted-foreground italic">
            Untagged
          </span>
        )}
      </CardFooter>
    </Card>
  )
}

function SourceMark(props: { readonly domain?: string }) {
  const favicon = faviconUrl(props.domain)
  if (favicon) {
    return (
      <img
        src={favicon}
        alt=""
        width={16}
        height={16}
        className="size-4 shrink-0 rounded-sm"
      />
    )
  }
  return <GlobeIcon className="size-4 shrink-0" />
}

function confirmDelete(id: string, mutate: (contentId: string) => void) {
  if (
    !window.confirm(
      "Move this item to trash? You can restore it within the retention period."
    )
  ) {
    return
  }
  mutate(id)
}
