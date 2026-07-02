import type { NoteResponse } from "@workspace/contracts"
import { relativeTime } from "@workspace/dates"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@workspace/ui/components/menu"
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react"

type NotesListItemProps = {
  note: NoteResponse
  selected: boolean
  onSelect: (checked: boolean) => void
  onEdit: () => void
  onDelete: () => void
  disabled?: boolean
}

export function NotesListItem({
  note,
  selected,
  onSelect,
  onEdit,
  onDelete,
  disabled,
}: NotesListItemProps) {
  return (
    <li className="flex items-start gap-3 px-4 py-4 sm:items-center">
      <Checkbox
        aria-label={`Select ${note.title}`}
        checked={selected}
        disabled={disabled}
        onCheckedChange={(checked) => onSelect(checked === true)}
      />

      <Button
        className="h-auto min-w-0 flex-1 flex-col items-start gap-1 px-2 py-1 text-left"
        disabled={disabled}
        onClick={onEdit}
        type="button"
        variant="ghost"
      >
        <span className="truncate font-medium">{note.title}</span>
        {note.body ? (
          <span className="line-clamp-2 text-sm text-muted-foreground">
            {note.body}
          </span>
        ) : null}
        <span className="text-xs text-muted-foreground">
          Updated {relativeTime(note.updatedAt)}
        </span>
      </Button>

      <Menu>
        <MenuTrigger
          aria-label={`Actions for ${note.title}`}
          disabled={disabled}
          render={<Button size="icon-sm" variant="ghost" />}
        >
          <MoreHorizontalIcon className="size-4" />
        </MenuTrigger>
        <MenuPopup align="end">
          <MenuItem onClick={onEdit}>
            <PencilIcon className="size-4" />
            Edit
          </MenuItem>
          <MenuSeparator />
          <MenuItem onClick={onDelete}>
            <Trash2Icon className="size-4 text-destructive" />
            <span className="text-destructive">Delete</span>
          </MenuItem>
        </MenuPopup>
      </Menu>
    </li>
  )
}
