import { XIcon } from "lucide-react"
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import type { ContentResponse } from "@workspace/contracts"
import { useUpdateContent } from "@/features/library/hooks/use-content"
import { useTopicList } from "@/features/topics/hooks/use-topics"

export function LibraryContentDetailTopics(props: {
  readonly item: ContentResponse
}) {
  const { item } = props
  const update = useUpdateContent()
  const topics = useTopicList()
  const linkedIds = item.topicSnapshot.map((topic) => topic.topicId)
  const available = (topics.data?.items ?? []).filter(
    (topic) => !topic.isRoot && !linkedIds.includes(topic.id)
  )

  function setTopicIds(topicIds: string[]) {
    update.mutate({ id: item.id, body: { topicIds } })
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Topics</CardTitle>
        <CardDescription>
          Link this item to knowledge-graph topics.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {item.topicSnapshot.length === 0 ? (
            <span className="text-sm text-muted-foreground italic">
              Untagged
              {item.isOrphan ? " · orphan" : null}
            </span>
          ) : (
            item.topicSnapshot.map((topic) => (
              <Badge
                key={topic.topicId}
                variant="secondary"
                className="gap-1 pr-1"
              >
                {topic.name}
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  aria-label={`Remove ${topic.name}`}
                  disabled={update.isPending}
                  onClick={() =>
                    setTopicIds(linkedIds.filter((id) => id !== topic.topicId))
                  }
                >
                  <XIcon />
                </Button>
              </Badge>
            ))
          )}
        </div>
        {available.length > 0 ? (
          <Select
            key={linkedIds.join("|")}
            disabled={update.isPending || linkedIds.length >= 10}
            onValueChange={(value) => {
              if (typeof value !== "string" || !value) return
              if (linkedIds.includes(value)) return
              setTopicIds([...linkedIds, value])
            }}
          >
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Add topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {available.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : (
          <p className="text-sm text-muted-foreground">
            {topics.isLoading
              ? "Loading topics…"
              : "No more topics to add. Create topics from the Topics page."}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
