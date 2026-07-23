import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { FileTextIcon } from "lucide-react"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import type { ContentResponse } from "@workspace/contracts"
import {
  libraryTopicUrl,
  libraryViews,
  type LibraryView,
} from "@/config/app-navigation"
import { routes } from "@/config/routes"
import { useTopicList } from "@/features/topics/hooks/use-topics"
import { PageShell } from "@/features/shell/components/page-shell"
import { AddContentDialog } from "@/features/library/components/add-content-dialog"
import { AddContentMode } from "@/features/library/components/add-content-constants"
import {
  filterLibraryItems,
  LibraryCardSkeletonGrid,
  LibraryDaySection,
  LibraryToolbar,
  QuickAddCard,
  type LibraryDateFilter,
  type LibrarySourceFilter,
} from "@/features/library/components/library-cards"
import { useContentList } from "@/features/library/hooks/use-content"

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

interface AddDialogState {
  readonly open: boolean
  readonly mode: AddContentMode
  readonly initialUrl: string
}

const CLOSED_ADD_DIALOG: AddDialogState = {
  open: false,
  mode: AddContentMode.Link,
  initialUrl: "",
}

export function LibraryPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const view = readLibraryView(searchParams.get("status"))
  const topicId = searchParams.get("topic")
  const searchQuery = searchParams.get("q")?.trim() ?? ""
  const isArchive = view === "ARCHIVE"
  const addFromQuery = searchParams.get("add") === "url"

  const [dateFilter, setDateFilter] = useState<LibraryDateFilter>("ALL")
  const [sourceFilter, setSourceFilter] = useState<LibrarySourceFilter>("ALL")
  const [addDialog, setAddDialog] = useState<AddDialogState>(() =>
    addFromQuery
      ? { open: true, mode: AddContentMode.Link, initialUrl: "" }
      : CLOSED_ADD_DIALOG
  )

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

  function updateSearchParams(mutate: (params: URLSearchParams) => void) {
    const next = new URLSearchParams(searchParams)
    mutate(next)
    setSearchParams(next)
  }

  function openAddDialog(config: {
    readonly mode: AddContentMode
    readonly initialUrl?: string
  }) {
    setAddDialog({
      open: true,
      mode: config.mode,
      initialUrl: config.initialUrl ?? "",
    })
    updateSearchParams((params) => {
      params.set("add", "url")
    })
  }

  function closeAddDialog() {
    setAddDialog(CLOSED_ADD_DIALOG)
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

      <AddContentDialog
        open={addDialog.open}
        initialMode={addDialog.mode}
        initialUrl={addDialog.initialUrl}
        onOpenChange={(open) => {
          if (open) return
          closeAddDialog()
        }}
      />

      {contentQuery.isLoading ? <LibraryCardSkeletonGrid /> : null}

      {!contentQuery.isLoading && isArchive ? (
        <ArchiveBody dayGroups={dayGroups} isEmpty={items.length === 0} />
      ) : null}

      {!contentQuery.isLoading && !isArchive ? (
        <LibraryGrid
          dayGroups={dayGroups}
          onAddLink={() => openAddDialog({ mode: AddContentMode.Link })}
          onAddWikipedia={() =>
            openAddDialog({
              mode: AddContentMode.Wiki,
              initialUrl: WIKIPEDIA_URL_PREFIX,
            })
          }
          onAddPdf={() => openAddDialog({ mode: AddContentMode.Pdf })}
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
  onAddLink,
  onAddWikipedia,
  onAddPdf,
  onAskChat,
}: {
  readonly dayGroups: readonly [string, ContentResponse[]][]
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
            isSavingPdf={false}
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
