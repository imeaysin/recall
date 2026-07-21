import { HttpErrorCode } from "./http.errors"
import { FileErrorCode } from "./file.errors"
import { ContentErrorCode } from "./content.errors"
import { TopicErrorCode } from "./topic.errors"
import { ChatErrorCode } from "./chat.errors"
export * from "./http.errors"
export * from "./file.errors"
export * from "./content.errors"
export * from "./topic.errors"
export * from "./chat.errors"
export type DomainErrorCode =
  FileErrorCode | ContentErrorCode | TopicErrorCode | ChatErrorCode

export type ApiErrorCode = HttpErrorCode | DomainErrorCode

const API_ERROR_CODES = new Set<string>([
  ...Object.values(HttpErrorCode),
  ...Object.values(FileErrorCode),
  ...Object.values(ContentErrorCode),
  ...Object.values(TopicErrorCode),
  ...Object.values(ChatErrorCode),
])

export function isApiErrorCode(value: string): value is ApiErrorCode {
  return API_ERROR_CODES.has(value)
}
