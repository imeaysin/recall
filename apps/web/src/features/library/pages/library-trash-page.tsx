import { Trash2Icon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@workspace/ui/components/item"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { PageHeader } from "@/features/shell/components/page-header"
import { PageShell } from "@/features/shell/components/page-shell"
import {
  useContentTrashList,
  usePermanentDeleteContent,
  useRestoreTrashContent,
} from "../hooks/use-content"

export function LibraryTrashPage() {
  const trash = useContentTrashList()
  const restore = useRestoreTrashContent()
  const permanentDelete = usePermanentDeleteContent()
  const items = trash.data?.items ?? []

  return (
    <PageShell>
      <PageHeader
        title="Trash"
        description="Soft-deleted library items. Restore or permanently delete."
      />
      <TrashBody
        isLoading={trash.isLoading}
        items={items}
        isRestoring={restore.isPending}
        isDeleting={permanentDelete.isPending}
        onRestore={(id) => restore.mutate(id)}
        onPermanentDelete={(contentId) => permanentDelete.mutate(contentId)}
      />
    </PageShell>
  )
}

function TrashBody(props: {
  readonly isLoading: boolean
  readonly items: readonly {
    id: string
    title?: string
    sourceType?: string
    deletedAt: string
    purgeAt: string
    originalContentId: string
  }[]
  readonly isRestoring: boolean
  readonly isDeleting: boolean
  readonly onRestore: (id: string) => void
  readonly onPermanentDelete: (contentId: string) => void
}) {
  if (props.isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    )
  }

  if (props.items.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Trash2Icon />
          </EmptyMedia>
          <EmptyTitle>Trash is empty</EmptyTitle>
          <EmptyDescription>
            Deleted library items will appear here until they are purged.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const pending = props.isRestoring || props.isDeleting

  return (
    <ItemGroup>
      {props.items.map((item) => {
        const heading = item.title ?? item.sourceType ?? "Untitled"
        return (
          <Item key={item.id} variant="outline">
            <ItemContent>
              <ItemTitle>{heading}</ItemTitle>
              <ItemDescription>
                Deleted {new Date(item.deletedAt).toLocaleString()} · Purge{" "}
                {new Date(item.purgeAt).toLocaleDateString()}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => props.onRestore(item.id)}
              >
                Restore
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={pending}
                onClick={() => {
                  if (
                    window.confirm(
                      "Permanently delete this item and its vectors? This cannot be undone."
                    )
                  ) {
                    props.onPermanentDelete(item.originalContentId)
                  }
                }}
              >
                Delete forever
              </Button>
            </ItemActions>
          </Item>
        )
      })}
    </ItemGroup>
  )
}
