import type { ReactNode } from "react"
import {
  ChevronDownIcon,
  FileTextIcon,
  FileUpIcon,
  GlobeIcon,
  ImageIcon,
  Link2Icon,
  MoreHorizontalIcon,
  SparklesIcon,
  VideoIcon,
  XIcon,
} from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { cn } from "@workspace/ui/lib/utils"
import type { ContentResponse } from "@workspace/contracts"
import {
  useRegenerateContent,
  useRetryContent,
  useSoftDeleteContent,
  useUpdateContent,
} from "../hooks/use-content"

export type LibrarySourceFilter = "ALL" | ContentResponse["sourceType"]
export type LibraryDateFilter = "ALL" | "TODAY" | "YESTERDAY" | "WEEK"

/** Responsive square tiles — width from grid, height from aspect-square. */
const CARD_GRID_CLASS =
  "grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"

const LIBRARY_CARD_CLASS = "aspect-square gap-0 py-0"
function domainFromUrl(url?: string) {
  if (!url) return undefined
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return undefined
  }
}

function faviconUrl(domain?: string) {
  if (!domain) return undefined
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function matchesDateFilter(iso: string, filter: LibraryDateFilter) {
  if (filter === "ALL") return true
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return false

  const diffDays = Math.round(
    (startOfDay(new Date()).getTime() - startOfDay(date).getTime()) / 86_400_000
  )
  if (filter === "TODAY") return diffDays === 0
  if (filter === "YESTERDAY") return diffDays === 1
  return diffDays >= 0 && diffDays <= 7
}

function sourceIcon(sourceType: ContentResponse["sourceType"]) {
  if (sourceType === "YOUTUBE") return <VideoIcon className="size-7" />
  if (sourceType === "PDF") return <FileTextIcon className="size-7" />
  if (sourceType === "IMAGE") return <ImageIcon className="size-7" />
  return <GlobeIcon className="size-7" />
}

function dateFilterLabel(filter: LibraryDateFilter) {
  if (filter === "TODAY") return "Today"
  if (filter === "YESTERDAY") return "Yesterday"
  if (filter === "WEEK") return "Past week"
  return "Date"
}

function sourceFilterLabel(filter: LibrarySourceFilter) {
  if (filter === "ALL") return "Source"
  if (filter === "ARTICLE") return "Article"
  if (filter === "YOUTUBE") return "YouTube"
  if (filter === "PDF") return "PDF"
  return "Image"
}

export function filterLibraryItems(
  items: readonly ContentResponse[],
  filters: {
    dateFilter: LibraryDateFilter
    sourceFilter: LibrarySourceFilter
  }
) {
  return items.filter((item) => {
    if (
      filters.sourceFilter !== "ALL" &&
      item.sourceType !== filters.sourceFilter
    ) {
      return false
    }
    return matchesDateFilter(item.updatedAt, filters.dateFilter)
  })
}

export function LibraryToolbar({
  activeTopicName,
  topics,
  dateFilter,
  sourceFilter,
  canReset,
  onClearTopic,
  onSelectTopic,
  onDateFilterChange,
  onSourceFilterChange,
  onReset,
}: {
  readonly activeTopicName?: string
  readonly topics: readonly { id: string; name: string }[]
  readonly dateFilter: LibraryDateFilter
  readonly sourceFilter: LibrarySourceFilter
  readonly canReset: boolean
  readonly onClearTopic?: () => void
  readonly onSelectTopic: (topicId: string | null) => void
  readonly onDateFilterChange: (value: LibraryDateFilter) => void
  readonly onSourceFilterChange: (value: LibrarySourceFilter) => void
  readonly onReset: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button type="button" variant="outline" size="sm" />}
        >
          {dateFilterLabel(dateFilter)}
          <ChevronDownIcon data-icon="inline-end" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuRadioGroup
            value={dateFilter}
            onValueChange={(value) =>
              onDateFilterChange(value as LibraryDateFilter)
            }
          >
            <DropdownMenuRadioItem value="ALL">All dates</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="TODAY">Today</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="YESTERDAY">
              Yesterday
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="WEEK">
              Past week
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button type="button" variant="outline" size="sm" />}
        >
          {sourceFilterLabel(sourceFilter)}
          <ChevronDownIcon data-icon="inline-end" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuRadioGroup
            value={sourceFilter}
            onValueChange={(value) =>
              onSourceFilterChange(value as LibrarySourceFilter)
            }
          >
            <DropdownMenuRadioItem value="ALL">
              All sources
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="ARTICLE">
              Article
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="YOUTUBE">
              YouTube
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="PDF">PDF</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="IMAGE">Image</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button type="button" variant="outline" size="sm" />}
        >
          {activeTopicName ?? "Tags"}
          <ChevronDownIcon data-icon="inline-end" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onSelectTopic(null)}>
              All tags
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelectTopic("untagged")}>
              Untagged Cards
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {topics.length > 0 ? <DropdownMenuSeparator /> : null}
          <DropdownMenuGroup>
            {topics.map((topic) => (
              <DropdownMenuItem
                key={topic.id}
                onClick={() => onSelectTopic(topic.id)}
              >
                {topic.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {activeTopicName ? (
        <Badge variant="secondary" className="gap-1 pr-1">
          {activeTopicName}
          {onClearTopic ? (
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label="Clear topic filter"
              onClick={onClearTopic}
            >
              <XIcon />
            </Button>
          ) : null}
        </Badge>
      ) : null}

      {canReset ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={onReset}
        >
          Reset
        </Button>
      ) : null}
    </div>
  )
}

export function LibraryDaySection({
  label,
  items,
  leading,
}: {
  readonly label: string
  readonly items: readonly ContentResponse[]
  readonly leading?: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold tracking-tight text-muted-foreground">
        {label}
      </h2>
      <div className={CARD_GRID_CLASS}>
        {leading}
        {items.map((item) => (
          <LibraryContentCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

export function LibraryCardSkeletonGrid() {
  return (
    <div className={CARD_GRID_CLASS}>
      <div className="aspect-square animate-pulse rounded-xl bg-muted" />
      <div className="aspect-square animate-pulse rounded-xl bg-muted" />
      <div className="aspect-square animate-pulse rounded-xl bg-muted" />
    </div>
  )
}

export function QuickAddCard({
  isSavingPdf,
  onAddLink,
  onAddWikipedia,
  onAddPdf,
  onAskChat,
}: {
  readonly isSavingPdf: boolean
  readonly onAddLink: () => void
  readonly onAddWikipedia: () => void
  readonly onAddPdf: () => void
  readonly onAskChat: () => void
}) {
  return (
    <Card size="sm" className={LIBRARY_CARD_CLASS}>
      <CardContent className="grid size-full grid-cols-2 grid-rows-2 gap-0 p-0">
        <QuickAddCell
          icon={<Link2Icon />}
          label="Add link"
          onClick={onAddLink}
          className="border-r border-b"
        />
        <QuickAddCell
          icon={<SparklesIcon />}
          label="Ask chat"
          onClick={onAskChat}
          className="border-b"
        />
        <QuickAddCell
          icon={<GlobeIcon />}
          label="Wikipedia"
          onClick={onAddWikipedia}
          className="border-r"
        />
        <QuickAddCell
          icon={<FileUpIcon />}
          label={isSavingPdf ? "Uploading…" : "PDF"}
          disabled={isSavingPdf}
          onClick={onAddPdf}
        />
      </CardContent>
    </Card>
  )
}

function QuickAddCell({
  icon,
  label,
  onClick,
  disabled,
  className,
}: {
  readonly icon: ReactNode
  readonly label: string
  readonly onClick?: () => void
  readonly disabled?: boolean
  readonly className?: string
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-full rounded-none text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        className
      )}
    >
      <span className="flex flex-col items-center gap-1.5 text-[10px] font-medium tracking-wider uppercase">
        {icon}
        {label}
      </span>
    </Button>
  )
}

export function LibraryContentCard({
  item,
}: {
  readonly item: ContentResponse
}) {
  const update = useUpdateContent()
  const softDelete = useSoftDeleteContent()
  const regenerate = useRegenerateContent()
  const retry = useRetryContent()

  const title = item.title ?? item.sourceUrl ?? "Untitled"
  const domain = domainFromUrl(item.sourceUrl)
  const favicon = faviconUrl(domain)
  const topicName = item.topicSnapshot[0]?.name
  const nextStatus = item.libraryStatus === "QUEUE" ? "ARCHIVE" : "QUEUE"
  const isPending =
    update.isPending ||
    softDelete.isPending ||
    regenerate.isPending ||
    retry.isPending

  return (
    <Card size="sm" className={LIBRARY_CARD_CLASS}>
      <CardContent className="flex min-h-0 flex-1 items-center justify-center bg-muted/40 p-0 text-muted-foreground">
        {sourceIcon(item.sourceType)}
      </CardContent>
      <CardHeader className="gap-1 border-t py-2.5">
        <CardTitle className="line-clamp-2 text-sm leading-snug">
          {title}
        </CardTitle>
        <CardDescription className="flex items-center gap-1 text-xs tracking-wide uppercase">
          {favicon ? (
            <img
              src={favicon}
              alt=""
              width={12}
              height={12}
              className="size-3 shrink-0 rounded-sm"
            />
          ) : (
            <GlobeIcon className="size-3 shrink-0" />
          )}
          <span className="truncate">
            {domain?.toUpperCase() ?? item.sourceType}
          </span>
        </CardDescription>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  size="icon-xs"
                  variant="ghost"
                  aria-label="Item actions"
                />
              }
            >
              <MoreHorizontalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  disabled={isPending}
                  onClick={() =>
                    update.mutate({
                      id: item.id,
                      body: { libraryStatus: nextStatus },
                    })
                  }
                >
                  {nextStatus === "ARCHIVE" ? "Archive" : "Move to queue"}
                </DropdownMenuItem>
                {item.status === "COMPLETED" ? (
                  <DropdownMenuItem
                    disabled={isPending}
                    onClick={() => regenerate.mutate({ id: item.id })}
                  >
                    Regenerate
                  </DropdownMenuItem>
                ) : null}
                {item.status === "FAILED" || item.errorCode ? (
                  <DropdownMenuItem
                    disabled={isPending}
                    onClick={() => retry.mutate(item.id)}
                  >
                    Retry
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => {
                    if (
                      !window.confirm(
                        "Move this item to trash? You can restore it within the retention period."
                      )
                    ) {
                      return
                    }
                    softDelete.mutate(item.id)
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardFooter className="border-0 bg-transparent pt-0">
        {topicName ? (
          <Badge variant="secondary" className="max-w-full truncate">
            {topicName}
          </Badge>
        ) : (
          <Badge variant="outline">{item.status}</Badge>
        )}
      </CardFooter>
    </Card>
  )
}
