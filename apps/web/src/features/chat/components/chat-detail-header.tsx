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
    <div className="mx-auto flex w-full max-w-3xl shrink-0 items-center justify-between gap-3 px-4 pt-4 md:px-6 md:pt-6">
      <div className="min-w-0">
        {props.renaming ? (
          <RenameTitleFields
            renameTitle={props.renameTitle}
            updatePending={props.updatePending}
            onRenameTitleChange={props.onRenameTitleChange}
            onSaveRename={props.onSaveRename}
            onCancelRename={props.onCancelRename}
          />
        ) : (
          <h1 className="truncate text-xl font-semibold tracking-tight text-muted-foreground">
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
    </div>
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
    <FieldGroup className="max-w-md">
      <Field>
        <FieldLabel htmlFor="chat-title">Title</FieldLabel>
        <Input
          id="chat-title"
          value={props.renameTitle}
          onChange={(event) => props.onRenameTitleChange(event.target.value)}
          maxLength={CHAT_TITLE_MAX_LENGTH}
          autoFocus
        />
      </Field>
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={props.updatePending}
          onClick={props.onSaveRename}
        >
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={props.onCancelRename}>
          Cancel
        </Button>
      </div>
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
