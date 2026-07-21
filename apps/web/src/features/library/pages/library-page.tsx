import { useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { FileTextIcon, Link2Icon } from "lucide-react"
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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import type { ContentResponse } from "@workspace/contracts"
import {
  libraryTopicUrl,
  libraryViews,
  type LibraryView,
} from "@/config/app-navigation"
import { routes } from "@/config/routes"
import { useTopicList } from "@/features/topics/hooks/use-topics"
import { PageShell } from "@/features/shell/components/page-shell"
import {
  filterLibraryItems,
  LibraryCardSkeletonGrid,
  LibraryDaySection,
  LibraryToolbar,
  QuickAddCard,
  type LibraryDateFilter,
  type LibrarySourceFilter,
} from "../components/library-cards"
import {
  useContentList,
  useSavePdfContent,
  useSaveUrlContent,
} from "../hooks/use-content"

const WIKIPEDIA_URL_PREFIX = "https://en.wikipedia.org/wiki/"

function readLibraryView(value: string | null): LibraryView {
  if (value === libraryViews.archive) return libraryViews.archive
  return libraryViews.queue
}

function dayOrdinal(day: number) {
  if (day % 10 === 1 && day !== 11) return "ST"
  if (day % 10 === 2 && day !== 12) return "ND"
  if (day % 10 === 3 && day !== 13) return "RD"
  return "TH"
}

function dayLabel(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "Earlier"

  const today = new Date()
  const startToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )
  const startThat = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  )
  const diffDays = Math.round(
    (startToday.getTime() - startThat.getTime()) / 86_400_000
  )
  const ordinal = dayOrdinal(date.getDate())

  if (diffDays === 0) return `Today ${date.getDate()}${ordinal}`
  if (diffDays === 1) return `Yesterday ${date.getDate()}${ordinal}`
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

function filterByTopic(
  items: readonly ContentResponse[],
  topicId: string | null
) {
  if (!topicId) return items
  if (topicId === "untagged") {
    return items.filter(
      (item) => item.isOrphan || item.topicSnapshot.length === 0
    )
  }
  return items.filter((item) =>
    item.topicSnapshot.some((entry) => entry.topicId === topicId)
  )
}

function groupByDay(items: readonly ContentResponse[]) {
  const groups = new Map<string, ContentResponse[]>()
  for (const item of items) {
    const label = dayLabel(item.updatedAt)
    const bucket = groups.get(label) ?? []
    bucket.push(item)
    groups.set(label, bucket)
  }
  return [...groups.entries()]
}

function activeTopicLabel(
  topicId: string | null,
  topics: readonly { id: string; name: string }[]
) {
  if (!topicId) return undefined
  if (topicId === "untagged") return "Untagged Cards"
  return topics.find((topic) => topic.id === topicId)?.name
}

export function LibraryPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const view = readLibraryView(searchParams.get("status"))
  const topicId = searchParams.get("topic")
  const searchQuery = searchParams.get("q")?.trim() ?? ""
  const isAddingUrl = searchParams.get("add") === "url"
  const isArchive = view === "ARCHIVE"

  const [url, setUrl] = useState("")
  const [dateFilter, setDateFilter] = useState<LibraryDateFilter>("ALL")
  const [sourceFilter, setSourceFilter] = useState<LibrarySourceFilter>("ALL")
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const saveUrl = useSaveUrlContent()
  const savePdf = useSavePdfContent()
  const topicsQuery = useTopicList(true)
  const contentQuery = useContentList({
    libraryStatus: isArchive ? "ARCHIVE" : "QUEUE",
    search: searchQuery || undefined,
  })

  const topics = (topicsQuery.data?.items ?? [])
    .filter((topic) => !topic.isRoot)
    .map((topic) => ({ id: topic.id, name: topic.name }))

  const items = filterLibraryItems(
    filterByTopic(contentQuery.data?.items ?? [], isArchive ? null : topicId),
    { dateFilter, sourceFilter }
  )
  const dayGroups = groupByDay(items)
  const topicLabel = activeTopicLabel(topicId, topics)
  const canResetFilters =
    dateFilter !== "ALL" ||
    sourceFilter !== "ALL" ||
    Boolean(topicId) ||
    Boolean(searchQuery)

  const urlError =
    saveUrl.error instanceof Error
      ? saveUrl.error.message
      : "Failed to save URL"
  const pdfError =
    savePdf.error instanceof Error
      ? savePdf.error.message
      : "Failed to upload PDF"

  function updateSearchParams(mutate: (params: URLSearchParams) => void) {
    const next = new URLSearchParams(searchParams)
    mutate(next)
    setSearchParams(next)
  }

  function openUrlForm(initialUrl = "") {
    setUrl(initialUrl)
    updateSearchParams((params) => {
      params.set("add", "url")
    })
  }

  function closeUrlForm() {
    setUrl("")
    updateSearchParams((params) => {
      params.delete("add")
    })
  }

  function selectTopic(nextTopicId: string | null) {
    if (!nextTopicId) {
      updateSearchParams((params) => {
        params.delete("topic")
      })
      return
    }
    navigate(libraryTopicUrl(nextTopicId))
  }

  function resetFilters() {
    setDateFilter("ALL")
    setSourceFilter("ALL")
    updateSearchParams((params) => {
      params.delete("topic")
      params.delete("q")
      params.delete("add")
    })
  }

  return (
    <PageShell>
      <LibraryToolbar
        activeTopicName={topicLabel}
        topics={topics}
        dateFilter={dateFilter}
        sourceFilter={sourceFilter}
        canReset={canResetFilters}
        onClearTopic={() => selectTopic(null)}
        onSelectTopic={selectTopic}
        onDateFilterChange={setDateFilter}
        onSourceFilterChange={setSourceFilter}
        onReset={resetFilters}
      />

      {isAddingUrl ? (
        <Card size="sm" className="max-w-xl">
          <CardHeader>
            <CardTitle>Save URL</CardTitle>
            <CardDescription>Articles, docs, or YouTube links.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                const trimmed = url.trim()
                if (!trimmed) return
                saveUrl.mutate({ url: trimmed }, { onSuccess: closeUrlForm })
              }}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="library-url">URL</FieldLabel>
                  <Input
                    id="library-url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://example.com/article"
                    type="url"
                    required
                    autoFocus
                  />
                  {saveUrl.isError ? (
                    <FieldDescription className="text-destructive">
                      {urlError}
                    </FieldDescription>
                  ) : null}
                </Field>
                <div className="flex gap-2">
                  <Button type="submit" disabled={saveUrl.isPending}>
                    <Link2Icon data-icon="inline-start" />
                    {saveUrl.isPending ? "Saving…" : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeUrlForm}
                  >
                    Cancel
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (!file) return
          savePdf.mutate(file, {
            onSuccess: () => {
              event.target.value = ""
            },
          })
        }}
      />
      {savePdf.isError ? (
        <FieldDescription className="text-destructive">
          {pdfError}
        </FieldDescription>
      ) : null}

      {contentQuery.isLoading ? <LibraryCardSkeletonGrid /> : null}

      {!contentQuery.isLoading && isArchive ? (
        <ArchiveBody dayGroups={dayGroups} isEmpty={items.length === 0} />
      ) : null}

      {!contentQuery.isLoading && !isArchive ? (
        <LibraryGrid
          dayGroups={dayGroups}
          isSavingPdf={savePdf.isPending}
          onAddLink={() => openUrlForm()}
          onAddWikipedia={() => openUrlForm(WIKIPEDIA_URL_PREFIX)}
          onAddPdf={() => pdfInputRef.current?.click()}
          onAskChat={() => navigate(routes.chat)}
        />
      ) : null}
    </PageShell>
  )
}

function ArchiveBody({
  dayGroups,
  isEmpty,
}: {
  readonly dayGroups: readonly [string, ContentResponse[]][]
  readonly isEmpty: boolean
}) {
  if (isEmpty) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileTextIcon />
          </EmptyMedia>
          <EmptyTitle>Archive is empty</EmptyTitle>
          <EmptyDescription>
            Archive items from your library when you are done with them.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <>
      {dayGroups.map(([label, items]) => (
        <LibraryDaySection key={label} label={label} items={items} />
      ))}
    </>
  )
}

function LibraryGrid({
  dayGroups,
  isSavingPdf,
  onAddLink,
  onAddWikipedia,
  onAddPdf,
  onAskChat,
}: {
  readonly dayGroups: readonly [string, ContentResponse[]][]
  readonly isSavingPdf: boolean
  readonly onAddLink: () => void
  readonly onAddWikipedia: () => void
  readonly onAddPdf: () => void
  readonly onAskChat: () => void
}) {
  const today = dayLabel(new Date().toISOString())
  const todayItems = dayGroups.find(([label]) => label === today)?.[1] ?? []
  const olderGroups = dayGroups.filter(([label]) => label !== today)

  return (
    <>
      <LibraryDaySection
        label={today}
        items={todayItems}
        leading={
          <QuickAddCard
            isSavingPdf={isSavingPdf}
            onAddLink={onAddLink}
            onAddWikipedia={onAddWikipedia}
            onAddPdf={onAddPdf}
            onAskChat={onAskChat}
          />
        }
      />
      {olderGroups.map(([label, items]) => (
        <LibraryDaySection key={label} label={label} items={items} />
      ))}
    </>
  )
}
