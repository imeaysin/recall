export const NotificationErrorCode = {
  NOT_FOUND: "NOTIFICATION.NOT_FOUND",
  INVALID_PUSH_TOKEN: "NOTIFICATION.INVALID_PUSH_TOKEN",
} as const

export type NotificationErrorCode =
  (typeof NotificationErrorCode)[keyof typeof NotificationErrorCode]
