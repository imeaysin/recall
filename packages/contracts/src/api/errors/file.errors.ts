export const FileErrorCode = {
  REQUIRED: "FILE.REQUIRED",
  NOT_FOUND: "FILE.NOT_FOUND",
  INVALID_PATH: "FILE.INVALID_PATH",
} as const

export type FileErrorCode = (typeof FileErrorCode)[keyof typeof FileErrorCode]
