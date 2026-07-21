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
import {
  CHAT_DELETE_CONFIRM,
  CHAT_FALLBACK_TITLE,
  CHAT_TITLE_MAX_LENGTH,
} from "@/features/chat/constants"

interface ChatDetailHeaderProps {
  readonly title: string | undefined
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
    <header className="absolute inset-x-0 top-0 z-20 flex h-12 items-center gap-2 bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="min-w-0 flex-1">
        {props.renaming ? (
          <RenameTitleFields
            renameTitle={props.renameTitle}
            updatePending={props.updatePending}
            onRenameTitleChange={props.onRenameTitleChange}
            onSaveRename={props.onSaveRename}
            onCancelRename={props.onCancelRename}
          />
        ) : (
          <h1 className="truncate text-sm font-medium tracking-tight">
            {props.title ?? CHAT_FALLBACK_TITLE}
          </h1>
        )}
      </div>
      {!props.renaming ? (
        <ChatActionsMenu
          actionPending={props.actionPending}
          onStartRename={props.onStartRename}
          onDelete={props.onDelete}
        />
      ) : null}
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
    <FieldGroup className="flex-row items-center gap-2">
      <Field className="min-w-0 flex-1 gap-0">
        <FieldLabel htmlFor="chat-title" className="sr-only">
          Title
        </FieldLabel>
        <Input
          id="chat-title"
          value={props.renameTitle}
          onChange={(event) => props.onRenameTitleChange(event.target.value)}
          maxLength={CHAT_TITLE_MAX_LENGTH}
          className="h-8"
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
          <Button size="icon-sm" variant="ghost" aria-label="Chat actions" />
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
