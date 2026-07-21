import { Link } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { routes } from "@/config/routes"
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Trash</h1>
          <p className="text-sm text-muted-foreground">
            Soft-deleted library items. Restore or permanently delete.
          </p>
        </div>
        <Button
          nativeButton={false}
          variant="outline"
          size="sm"
          render={<Link to={routes.library} />}
        >
          Back to library
        </Button>
      </div>

      {trash.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border">
          {items.map((item) => {
            const heading = item.title ?? item.sourceType ?? "Untitled"
            const pending = restore.isPending || permanentDelete.isPending
            return (
              <li
                key={item.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{heading}</p>
                  <p className="text-xs text-muted-foreground">
                    Deleted {new Date(item.deletedAt).toLocaleString()} · Purge{" "}
                    {new Date(item.purgeAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => restore.mutate(item.id)}
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
                        permanentDelete.mutate(item.originalContentId)
                      }
                    }}
                  >
                    Delete forever
                  </Button>
                </div>
              </li>
            )
          })}
          {items.length === 0 ? (
            <li className="p-4 text-sm text-muted-foreground">
              Trash is empty.
            </li>
          ) : null}
        </ul>
      )}
    </div>
  )
}
