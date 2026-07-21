import type { ContentSourceType } from "@workspace/db"

const CONTENT_SOURCE_TYPES = new Set<string>([
  "ARTICLE",
  "YOUTUBE",
  "PDF",
  "IMAGE",
])

export type TrashTopicSnapshot = {
  readonly topicId: string
  readonly name: string
}

export type TrashSnapshot = {
  readonly title?: string
  readonly sourceType?: ContentSourceType
  readonly topicSnapshot: readonly TrashTopicSnapshot[]
}

function isTopicSnapshotEntry(value: object): value is TrashTopicSnapshot {
  return (
    "topicId" in value &&
    "name" in value &&
    typeof value.topicId === "string" &&
    typeof value.name === "string"
  )
}

function isContentSourceType(value: string): value is ContentSourceType {
  return CONTENT_SOURCE_TYPES.has(value)
}

export function parseTrashSnapshot(raw: object): TrashSnapshot {
  const title =
    "title" in raw && typeof raw.title === "string" ? raw.title : undefined
  const sourceTypeRaw =
    "sourceType" in raw && typeof raw.sourceType === "string"
      ? raw.sourceType
      : undefined
  const sourceType =
    sourceTypeRaw && isContentSourceType(sourceTypeRaw)
      ? sourceTypeRaw
      : undefined

  const topicSnapshot: TrashTopicSnapshot[] = []
  if ("topicSnapshot" in raw && Array.isArray(raw.topicSnapshot)) {
    for (const entry of raw.topicSnapshot) {
      if (typeof entry !== "object" || entry === null) continue
      if (!isTopicSnapshotEntry(entry)) continue
      topicSnapshot.push({ topicId: entry.topicId, name: entry.name })
    }
  }

  return { title, sourceType, topicSnapshot }
}
