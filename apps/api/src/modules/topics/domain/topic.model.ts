export type TopicEntity = {
  readonly id: string
  readonly userId: string
  readonly name: string
  readonly normalizedName: string
  readonly contentCount: number
  readonly isUserCreated: boolean
  readonly color?: string
  readonly mergedIntoTopicId?: string
  readonly createdAt: Date
  readonly updatedAt: Date
}

export type TopicActorScope = {
  readonly userId: string
}

export type TopicMutationScope = {
  readonly userId: string
  readonly topicId: string
}
