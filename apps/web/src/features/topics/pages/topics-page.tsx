import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  useCreateTopic,
  useDeleteTopic,
  useMergeTopic,
  useTopicList,
  useUpdateTopic,
} from "../hooks/use-topics"

export function TopicsPage() {
  const topics = useTopicList()
  const create = useCreateTopic()
  const update = useUpdateTopic()
  const remove = useDeleteTopic()
  const merge = useMergeTopic()

  const [newName, setNewName] = useState("")
  const [renameId, setRenameId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [mergeSourceId, setMergeSourceId] = useState("")
  const [mergeTargetId, setMergeTargetId] = useState("")

  const items = topics.data?.items ?? []
  const pending =
    create.isPending || update.isPending || remove.isPending || merge.isPending

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Topics</h1>
        <p className="text-sm text-muted-foreground">
          Manage knowledge-graph topics. Merge duplicates or rename user-created
          topics.
        </p>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          const name = newName.trim()
          if (!name) return
          create.mutate(
            { name },
            {
              onSuccess: () => setNewName(""),
            }
          )
        }}
      >
        <Input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="New topic name"
          maxLength={80}
        />
        <Button type="submit" disabled={create.isPending}>
          Create
        </Button>
      </form>

      <div className="rounded-lg border p-4">
        <h2 className="mb-2 text-sm font-semibold">Merge topics</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Move all content from the source topic into the target topic.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={mergeSourceId}
            onChange={(event) => setMergeSourceId(event.target.value)}
          >
            <option value="">Source topic…</option>
            {items
              .filter((t) => !t.isRoot && t.id !== mergeTargetId)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </select>
          <span className="text-sm text-muted-foreground">into</span>
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={mergeTargetId}
            onChange={(event) => setMergeTargetId(event.target.value)}
          >
            <option value="">Target topic…</option>
            {items
              .filter((t) => !t.isRoot && t.id !== mergeSourceId)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </select>
          <Button
            type="button"
            variant="outline"
            disabled={!mergeSourceId || !mergeTargetId || pending}
            onClick={() => {
              if (
                !window.confirm(
                  "Merge these topics? This cannot be undone easily."
                )
              ) {
                return
              }
              merge.mutate(
                { id: mergeSourceId, body: { intoTopicId: mergeTargetId } },
                {
                  onSuccess: () => {
                    setMergeSourceId("")
                    setMergeTargetId("")
                  },
                }
              )
            }}
          >
            Merge
          </Button>
        </div>
      </div>

      {topics.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border">
          {items.map((topic) => (
            <li
              key={topic.id}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              {renameId === topic.id ? (
                <div className="flex flex-1 gap-2">
                  <Input
                    value={renameValue}
                    onChange={(event) => setRenameValue(event.target.value)}
                    maxLength={80}
                  />
                  <Button
                    size="sm"
                    disabled={update.isPending}
                    onClick={() => {
                      const name = renameValue.trim()
                      if (!name) return
                      update.mutate(
                        { id: topic.id, body: { name } },
                        { onSuccess: () => setRenameId(null) }
                      )
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRenameId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-medium">
                      {topic.name}
                      {topic.isRoot ? (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (root)
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {topic.contentCount} items
                      {topic.isUserCreated ? " · user-created" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {topic.isUserCreated && !topic.isRoot ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={pending}
                          onClick={() => {
                            setRenameId(topic.id)
                            setRenameValue(topic.name)
                          }}
                        >
                          Rename
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={pending}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Delete topic "${topic.name}"? You must confirm this action.`
                              )
                            ) {
                              remove.mutate(topic.id)
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </>
                    ) : null}
                  </div>
                </>
              )}
            </li>
          ))}
          {items.length === 0 ? (
            <li className="p-4 text-sm text-muted-foreground">
              No topics yet.
            </li>
          ) : null}
        </ul>
      )}
    </div>
  )
}
