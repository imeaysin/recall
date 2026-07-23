import type { ContentResponse } from "@workspace/contracts"

export type LibrarySourceFilter = "ALL" | ContentResponse["sourceType"]
export type LibraryDateFilter = "ALL" | "TODAY" | "YESTERDAY" | "WEEK"

/**
 * Height comes from content (never clip footer/badge).
 * Grid stretch + h-full keeps a row aligned; media height is AspectRatio-fixed.
 */
export const LIBRARY_CARD_CLASS = "h-full"

export const LIBRARY_CARD_GRID_CLASS =
  "grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4"

/** Identical preview height on every card (width-driven). */
export const LIBRARY_CARD_MEDIA_RATIO = 16 / 10

/** Reserve two title lines so cards stay even with short/long titles. */
export const LIBRARY_CARD_TITLE_CLASS = "line-clamp-2 min-h-10"

export function domainFromUrl(url?: string) {
  if (!url) return undefined
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return undefined
  }
}

export function faviconUrl(domain?: string) {
  if (!domain) return undefined
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`
}

export function coverImageUrl(item: ContentResponse) {
  if (item.sourceType === "IMAGE" && item.sourceUrl) return item.sourceUrl
  if (item.sourceType !== "YOUTUBE") return undefined
  const id = youtubeVideoId(item.sourceUrl)
  if (!id) return undefined
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
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

export function dateFilterLabel(filter: LibraryDateFilter) {
  if (filter === "TODAY") return "Today"
  if (filter === "YESTERDAY") return "Yesterday"
  if (filter === "WEEK") return "Past week"
  return "Date"
}

export function sourceFilterLabel(filter: LibrarySourceFilter) {
  if (filter === "ALL") return "Source"
  if (filter === "ARTICLE") return "Article"
  if (filter === "YOUTUBE") return "YouTube"
  if (filter === "PDF") return "PDF"
  return "Image"
}

export function isLibraryDateFilter(value: string): value is LibraryDateFilter {
  return (
    value === "ALL" ||
    value === "TODAY" ||
    value === "YESTERDAY" ||
    value === "WEEK"
  )
}

export function isLibrarySourceFilter(
  value: string
): value is LibrarySourceFilter {
  return (
    value === "ALL" ||
    value === "ARTICLE" ||
    value === "YOUTUBE" ||
    value === "PDF" ||
    value === "IMAGE"
  )
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

function youtubeVideoId(url?: string) {
  if (!url) return undefined
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.split("/").filter(Boolean)[0]
    }
    const fromQuery = parsed.searchParams.get("v")
    if (fromQuery) return fromQuery
    const match = parsed.pathname.match(/\/(?:shorts|embed)\/([^/]+)/)
    return match?.[1]
  } catch {
    return undefined
  }
}
