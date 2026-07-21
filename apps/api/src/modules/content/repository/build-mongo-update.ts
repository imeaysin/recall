import type { Types } from "mongoose"
import type {
  ContentErrorCode,
  ContentProcessingStep,
  ContentStatus,
  LibraryStatus,
} from "@workspace/db"

export type ContentUpdatePatch = Partial<{
  readonly status: ContentStatus
  readonly processingStep: ContentProcessingStep
  readonly title: string
  readonly summary: string
  readonly wordCount: number
  readonly language: string
  readonly contentHash: string
  readonly possibleDuplicateOfContentId: Types.ObjectId
  readonly topicRefs: Types.ObjectId[]
  readonly topicSnapshot: { topicId: Types.ObjectId; name: string }[]
  readonly isOrphan: boolean
  readonly retryCount: number
  readonly lockedAt: Date | null
  readonly lockedBy: string | null
  readonly errorMessage: string | null
  readonly errorCode: ContentErrorCode | null
  readonly libraryStatus: LibraryStatus
  readonly titleEditedByUser: boolean
  readonly summaryEditedByUser: boolean
}>

type MongoPatchValue = ContentUpdatePatch[keyof ContentUpdatePatch]
type SetEntry = readonly [string, MongoPatchValue]
type UnsetEntry = readonly [string, ""]

export type MongoContentUpdate = {
  readonly $set?: Readonly<Record<string, MongoPatchValue>>
  readonly $unset?: Readonly<Record<string, "">>
}

type PartitionedEntries = {
  readonly setEntries: readonly SetEntry[]
  readonly unsetEntries: readonly UnsetEntry[]
}

export function buildMongoContentUpdate(
  patch: ContentUpdatePatch
): MongoContentUpdate | null {
  const { setEntries, unsetEntries } = Object.entries(
    patch
  ).reduce<PartitionedEntries>(
    (acc, [key, value]) => {
      if (value === null) {
        return {
          setEntries: acc.setEntries,
          unsetEntries: [...acc.unsetEntries, [key, ""]],
        }
      }
      if (value === undefined) return acc
      return {
        setEntries: [...acc.setEntries, [key, value]],
        unsetEntries: acc.unsetEntries,
      }
    },
    { setEntries: [], unsetEntries: [] }
  )

  if (setEntries.length === 0 && unsetEntries.length === 0) {
    return null
  }

  return {
    ...(setEntries.length > 0 ? { $set: Object.fromEntries(setEntries) } : {}),
    ...(unsetEntries.length > 0
      ? { $unset: Object.fromEntries(unsetEntries) }
      : {}),
  }
}
