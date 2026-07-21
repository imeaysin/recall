import { useState } from "react"
import { TagsIcon } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@workspace/ui/components/item"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { PageHeader } from "@/features/shell/components/page-header"
import { PageShell } from "@/features/shell/components/page-shell"
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
  const mergeable = items.filter((topic) => !topic.isRoot)
  const pending =
    create.isPending || update.isPending || remove.isPending || merge.isPending

  return (
    <PageShell>
      <PageHeader
        title="Topics"
        description="Manage knowledge-graph topics. Merge duplicates or rename user-created topics."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardTitle>Create topic</CardTitle>
            <CardDescription>
              Add a new topic to organize content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
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
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="new-topic">Name</FieldLabel>
                  <Input
                    id="new-topic"
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    placeholder="New topic name"
                    maxLength={80}
                  />
                </Field>
                <Button type="submit" disabled={create.isPending}>
                  Create
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Merge topics</CardTitle>
            <CardDescription>
              Move all content from the source topic into the target topic.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Source</FieldLabel>
                  <Select
                    value={mergeSourceId || null}
                    onValueChange={(value) => setMergeSourceId(value ?? "")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Source topic…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {mergeable
                          .filter((topic) => topic.id !== mergeTargetId)
                          .map((topic) => (
                            <SelectItem key={topic.id} value={topic.id}>
                              {topic.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Target</FieldLabel>
                  <Select
                    value={mergeTargetId || null}
                    onValueChange={(value) => setMergeTargetId(value ?? "")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Target topic…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {mergeable
                          .filter((topic) => topic.id !== mergeSourceId)
                          .map((topic) => (
                            <SelectItem key={topic.id} value={topic.id}>
                              {topic.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
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
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <TopicsList
        isLoading={topics.isLoading}
        items={items}
        pending={pending}
        renameId={renameId}
        renameValue={renameValue}
        onRenameChange={setRenameValue}
        onStartRename={(topic) => {
          setRenameId(topic.id)
          setRenameValue(topic.name)
        }}
        onCancelRename={() => setRenameId(null)}
        onSaveRename={(topicId) => {
          const name = renameValue.trim()
          if (!name) return
          update.mutate(
            { id: topicId, body: { name } },
            { onSuccess: () => setRenameId(null) }
          )
        }}
        onDelete={(topic) => {
          if (
            window.confirm(
              `Delete topic "${topic.name}"? You must confirm this action.`
            )
          ) {
            remove.mutate(topic.id)
          }
        }}
        renamePending={update.isPending}
      />
    </PageShell>
  )
}

function TopicsList(props: {
  readonly isLoading: boolean
  readonly items: readonly {
    id: string
    name: string
    contentCount: number
    isRoot: boolean
    isUserCreated: boolean
  }[]
  readonly pending: boolean
  readonly renameId: string | null
  readonly renameValue: string
  readonly renamePending: boolean
  readonly onRenameChange: (value: string) => void
  readonly onStartRename: (topic: { id: string; name: string }) => void
  readonly onCancelRename: () => void
  readonly onSaveRename: (topicId: string) => void
  readonly onDelete: (topic: { id: string; name: string }) => void
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
            <TagsIcon />
          </EmptyMedia>
          <EmptyTitle>No topics yet</EmptyTitle>
          <EmptyDescription>
            Create a topic to start organizing your knowledge graph.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <ItemGroup>
      {props.items.map((topic) => {
        if (props.renameId === topic.id) {
          return (
            <Item key={topic.id} variant="outline">
              <ItemContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor={`rename-${topic.id}`}>
                      Rename
                    </FieldLabel>
                    <Input
                      id={`rename-${topic.id}`}
                      value={props.renameValue}
                      onChange={(event) =>
                        props.onRenameChange(event.target.value)
                      }
                      maxLength={80}
                    />
                  </Field>
                  <ItemActions>
                    <Button
                      size="sm"
                      disabled={props.renamePending}
                      onClick={() => props.onSaveRename(topic.id)}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={props.onCancelRename}
                    >
                      Cancel
                    </Button>
                  </ItemActions>
                </FieldGroup>
              </ItemContent>
            </Item>
          )
        }

        return (
          <Item key={topic.id} variant="outline">
            <ItemContent>
              <ItemTitle>
                {topic.name}
                {topic.isRoot ? <Badge variant="secondary">root</Badge> : null}
              </ItemTitle>
              <ItemDescription>
                {topic.contentCount} items
                {topic.isUserCreated ? " · user-created" : ""}
              </ItemDescription>
            </ItemContent>
            {topic.isUserCreated && !topic.isRoot ? (
              <ItemActions>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={props.pending}
                  onClick={() => props.onStartRename(topic)}
                >
                  Rename
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={props.pending}
                  onClick={() => props.onDelete(topic)}
                >
                  Delete
                </Button>
              </ItemActions>
            ) : null}
          </Item>
        )
      })}
    </ItemGroup>
  )
}
