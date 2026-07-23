import { useState } from "react"
import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  MoreHorizontalIcon,
} from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import type { ContentResponse } from "@workspace/contracts"
import { LibraryDeleteContentDialog } from "@/features/library/components/library-delete-content-dialog"
import {
  contentStatusLabel,
  libraryStatusLabel,
} from "@/features/library/domain/content-status-labels"
import {
  useRegenerateContent,
  useSoftDeleteContent,
  useUpdateContent,
} from "@/features/library/hooks/use-content"

export function LibraryContentDetailHeader(props: {
  readonly item: ContentResponse
  readonly onBack: () => void
}) {
  const { item, onBack } = props
  const update = useUpdateContent()
  const softDelete = useSoftDeleteContent()
  const regenerate = useRegenerateContent()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const nextStatus = item.libraryStatus === "QUEUE" ? "ARCHIVE" : "QUEUE"
  const title = item.title ?? item.sourceUrl ?? "Untitled"
  const isPending =
    update.isPending || softDelete.isPending || regenerate.isPending

  return (
    <>
      <div className="flex flex-col gap-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-fit"
          onClick={onBack}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Library
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              {title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{contentStatusLabel(item)}</Badge>
              <Badge variant="outline">
                {libraryStatusLabel(item.libraryStatus)}
              </Badge>
              <Badge variant="outline">{item.sourceType}</Badge>
              {item.sourceUrl ? (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto px-0"
                  nativeButton={false}
                  render={
                    <a href={item.sourceUrl} target="_blank" rel="noreferrer" />
                  }
                >
                  Open source
                  <ExternalLinkIcon data-icon="inline-end" />
                </Button>
              ) : null}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label="Content actions"
                />
              }
            >
              <MoreHorizontalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  disabled={isPending}
                  onClick={() =>
                    update.mutate({
                      id: item.id,
                      body: { libraryStatus: nextStatus },
                    })
                  }
                >
                  {nextStatus === "ARCHIVE"
                    ? "Mark completed"
                    : "Move to read later"}
                </DropdownMenuItem>
                {item.status === "COMPLETED" ? (
                  <DropdownMenuItem
                    disabled={isPending}
                    onClick={() => regenerate.mutate({ id: item.id })}
                  >
                    Regenerate metadata
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => setDeleteOpen(true)}
                >
                  Move to trash
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <LibraryDeleteContentDialog
        open={deleteOpen}
        title={title}
        isPending={softDelete.isPending}
        onOpenChange={setDeleteOpen}
        onConfirm={() => {
          softDelete.mutate(item.id, { onSuccess: onBack })
        }}
      />
    </>
  )
}
