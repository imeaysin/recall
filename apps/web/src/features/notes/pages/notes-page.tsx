import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { ShellMain } from "@workspace/ui/components/shell"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { relativeTime } from "@workspace/dates"
import { Trash2Icon } from "lucide-react"
import { useState } from "react"
import {
  useCreateNoteMutation,
  useDeleteNoteMutation,
  useNotesQuery,
} from "@/features/notes/hooks/use-notes"

export function NotesPage() {
  const { data, isLoading, isError, error } = useNotesQuery()
  const createNote = useCreateNoteMutation()
  const deleteNote = useDeleteNoteMutation()
  const [title, setTitle] = useState("")

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    await createNote.mutateAsync({ title: trimmed, body: "" })
    setTitle("")
  }

  return (
    <ShellMain
      heading="Notes"
      subtitle="Example CRUD feature — calls the NestJS API with your JWT."
    >
      <form
        onSubmit={handleCreate}
        className="mb-8 flex max-w-lg flex-col gap-3 sm:flex-row"
      >
        <Input
          nativeInput
          placeholder="New note title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={createNote.isPending}
        />
        <Button type="submit" disabled={createNote.isPending || !title.trim()}>
          Add note
        </Button>
      </form>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full max-w-xl" />
          <Skeleton className="h-16 w-full max-w-xl" />
        </div>
      ) : null}

      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load notes"}
        </p>
      ) : null}

      {!isLoading && !isError && data?.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No notes yet. Create one above or run{" "}
          <code className="rounded bg-muted px-1">pnpm --filter api seed</code>.
        </p>
      ) : null}

      <ul className="max-w-xl divide-y divide-border">
        {data?.items.map((note) => (
          <li
            key={note.id}
            className="flex items-start justify-between gap-4 py-4"
          >
            <div className="min-w-0 space-y-1">
              <p className="font-medium">{note.title}</p>
              {note.body ? (
                <p className="text-sm text-muted-foreground">{note.body}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                {relativeTime(note.createdAt)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Delete note"
              disabled={deleteNote.isPending}
              onClick={() => deleteNote.mutate(note.id)}
            >
              <Trash2Icon className="size-4" />
            </Button>
          </li>
        ))}
      </ul>
    </ShellMain>
  )
}
