export type ChatEntity = {
  readonly id: string
  readonly userId: string
  readonly title: string
  readonly lastMessageAt: Date
  readonly messageCount: number
  readonly isDeleted: boolean
  readonly createdAt: Date
  readonly updatedAt: Date
}

export type ChatMessageEntity = {
  readonly id: string
  readonly chatId: string
  readonly userId: string
  readonly role: "user" | "assistant"
  readonly text: string
  readonly citations: readonly ChatMessageCitationEntity[]
  readonly retrievedChunkIds: readonly string[]
  readonly tokensUsed?: number
  readonly createdAt: Date
}

export type ChatMessageCitationEntity = {
  readonly contentId: string
  readonly title: string
  readonly sourceUrl?: string
  readonly chunkText: string
}

export type VectorChunkEntity = {
  readonly id: string
  readonly userId: string
  readonly contentId: string
  readonly chunkIndex: number
  readonly text: string
  readonly embedding: readonly number[]
}

export type ContentCitationMeta = {
  readonly contentId: string
  readonly title?: string
  readonly sourceUrl?: string
  readonly language?: string
  readonly isDeleted: boolean
  readonly missing: boolean
}

export type ChatActorScope = {
  readonly userId: string
}

export type ChatMutationScope = {
  readonly userId: string
  readonly chatId: string
}
