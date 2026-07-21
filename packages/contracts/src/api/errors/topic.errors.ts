export const TopicErrorCode = {
  TOPIC_NOT_FOUND: "TOPIC.NOT_FOUND",
  TOPIC_NOT_USER_CREATED: "TOPIC.NOT_USER_CREATED",
  TOPIC_MERGE_INVALID: "TOPIC.MERGE_INVALID",
  TOPIC_ROOT_PROTECTED: "TOPIC.ROOT_PROTECTED",
} as const

export type TopicErrorCode =
  (typeof TopicErrorCode)[keyof typeof TopicErrorCode]
