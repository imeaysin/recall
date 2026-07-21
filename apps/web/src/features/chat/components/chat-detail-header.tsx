import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import {
  CHAT_DELETE_CONFIRM,
  CHAT_TITLE_MAX_LENGTH,
} from "@/features/chat/constants"

interface ChatDetailHeaderProps {
  readonly renaming: boolean
  readonly renameTitle: string
  readonly actionPending: boolean
  readonly updatePending: boolean
  readonly onRenameTitleChange: (value: string) => void
  readonly onStartRename: () => void
  readonly onCancelRename: () => void
  readonly onSaveRename: () => void
  readonly onDelete: () => void
}

export function ChatDetailHeader(props: ChatDetailHeaderProps) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3 md:p-4">
      <SidebarTrigger className="pointer-events-auto md:hidden" />
      <div className="pointer-events-auto ml-auto flex items-center gap-1">
        {props.renaming ? (
          <RenameTitleFields
            renameTitle={props.renameTitle}
            updatePending={props.updatePending}
            onRenameTitleChange={props.onRenameTitleChange}
            onSaveRename={props.onSaveRename}
            onCancelRename={props.onCancelRename}
          />
        ) : (
          <ChatActionsMenu
            actionPending={props.actionPending}
            onStartRename={props.onStartRename}
            onDelete={props.onDelete}
          />
        )}
      </div>
    </header>
  )
}

function RenameTitleFields(props: {
  readonly renameTitle: string
  readonly updatePending: boolean
  readonly onRenameTitleChange: (value: string) => void
  readonly onSaveRename: () => void
  readonly onCancelRename: () => void
}) {
  return (
    <FieldGroup className="flex-row items-center gap-2 rounded-lg border bg-background/90 p-1.5 shadow-sm backdrop-blur-md">
      <Field className="min-w-0 flex-1 gap-0">
        <FieldLabel htmlFor="chat-title" className="sr-only">
          Title
        </FieldLabel>
        <Input
          id="chat-title"
          value={props.renameTitle}
          onChange={(event) => props.onRenameTitleChange(event.target.value)}
          maxLength={CHAT_TITLE_MAX_LENGTH}
          className="h-8 min-w-48"
          autoFocus
        />
      </Field>
      <Button
        size="sm"
        disabled={props.updatePending}
        onClick={props.onSaveRename}
      >
        Save
      </Button>
      <Button size="sm" variant="ghost" onClick={props.onCancelRename}>
        Cancel
      </Button>
    </FieldGroup>
  )
}

function ChatActionsMenu(props: {
  readonly actionPending: boolean
  readonly onStartRename: () => void
  readonly onDelete: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size="icon-sm"
            variant="ghost"
            className="bg-background/60 backdrop-blur-md"
            aria-label="Chat actions"
          />
        }
      >
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            disabled={props.actionPending}
            onClick={props.onStartRename}
          >
            <PencilIcon />
            Rename
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            disabled={props.actionPending}
            onClick={() => {
              if (!window.confirm(CHAT_DELETE_CONFIRM)) return
              props.onDelete()
            }}
          >
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
