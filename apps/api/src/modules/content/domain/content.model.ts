import type {
  ContentErrorCode,
  ContentProcessingStep,
  ContentSourceType,
  ContentStatus,
  LibraryStatus,
} from "@workspace/db"

export type ContentEntity = {
  readonly id: string
  readonly userId: string
  readonly sourceType: ContentSourceType
  readonly sourceUrl?: string
  readonly normalizedUrl?: string
  readonly contentHash?: string
  readonly possibleDuplicateOfContentId?: string
  readonly title?: string
  readonly titleEditedByUser: boolean
  readonly summary?: string
  readonly summaryEditedByUser: boolean
  readonly wordCount?: number
  readonly language?: string
  readonly topicRefs: readonly string[]
  readonly topicSnapshot: readonly { topicId: string; name: string }[]
  readonly isOrphan: boolean
  readonly status: ContentStatus
  readonly processingStep?: ContentProcessingStep
  readonly retryCount: number
  readonly lockedAt?: Date
  readonly lockedBy?: string
  readonly errorMessage?: string
  readonly errorCode?: ContentErrorCode
  readonly libraryStatus: LibraryStatus
  readonly isDeleted: boolean
  readonly deletedAt?: Date
  readonly createdAt: Date
  readonly updatedAt: Date
}

export type NewUrlContent = {
  readonly userId: string
  readonly sourceType: ContentSourceType
  readonly sourceUrl: string
  readonly normalizedUrl: string
}

export type ContentActorScope = {
  readonly userId: string
}

export type ContentMutationScope = {
  readonly userId: string
  readonly contentId: string
}
