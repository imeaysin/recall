import type { ReactNode } from "react"
import { ChevronDownIcon, XIcon } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
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
import {
  dateFilterLabel,
  isLibraryDateFilter,
  isLibrarySourceFilter,
  sourceFilterLabel,
  type LibraryDateFilter,
  type LibrarySourceFilter,
} from "@/features/library/components/library-card-shared"

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
      <FilterMenu
        label={dateFilterLabel(dateFilter)}
        value={dateFilter}
        onValueChange={(value) => {
          if (isLibraryDateFilter(value)) onDateFilterChange(value)
        }}
      >
        <DropdownMenuRadioItem value="ALL">All dates</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="TODAY">Today</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="YESTERDAY">
          Yesterday
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="WEEK">Past week</DropdownMenuRadioItem>
      </FilterMenu>

      <FilterMenu
        label={sourceFilterLabel(sourceFilter)}
        value={sourceFilter}
        onValueChange={(value) => {
          if (isLibrarySourceFilter(value)) onSourceFilterChange(value)
        }}
      >
        <DropdownMenuRadioItem value="ALL">All sources</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="ARTICLE">Article</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="YOUTUBE">YouTube</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="PDF">PDF</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="IMAGE">Image</DropdownMenuRadioItem>
      </FilterMenu>

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

function FilterMenu(props: {
  readonly label: string
  readonly value: string
  readonly onValueChange: (value: string) => void
  readonly children: ReactNode
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button type="button" variant="outline" size="sm" />}
      >
        {props.label}
        <ChevronDownIcon data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuRadioGroup
          value={props.value}
          onValueChange={props.onValueChange}
        >
          {props.children}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
