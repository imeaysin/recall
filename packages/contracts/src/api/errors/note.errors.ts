export const NoteErrorCode = {
  NOT_FOUND: "NOTE.NOT_FOUND",
  FORBIDDEN: "NOTE.FORBIDDEN",
} as const

export type NoteErrorCode = (typeof NoteErrorCode)[keyof typeof NoteErrorCode]
