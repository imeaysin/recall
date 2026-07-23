import { MoreHorizontalIcon } from "lucide-react"
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

export function LibraryCardActionsMenu(props: {
  readonly isPending: boolean
  readonly nextStatus: "ARCHIVE" | "QUEUE"
  readonly status: ContentResponse["status"]
  readonly hasError: boolean
  readonly onArchiveToggle: () => void
  readonly onRegenerate: () => void
  readonly onRetry: () => void
  readonly onDelete: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size="icon-xs" variant="ghost" aria-label="Item actions" />
        }
      >
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            disabled={props.isPending}
            onClick={props.onArchiveToggle}
          >
            {props.nextStatus === "ARCHIVE" ? "Archive" : "Move to queue"}
          </DropdownMenuItem>
          {props.status === "COMPLETED" ? (
            <DropdownMenuItem
              disabled={props.isPending}
              onClick={props.onRegenerate}
            >
              Regenerate
            </DropdownMenuItem>
          ) : null}
          {props.hasError ? (
            <DropdownMenuItem
              disabled={props.isPending}
              onClick={props.onRetry}
            >
              Retry
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            disabled={props.isPending}
            onClick={props.onDelete}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
