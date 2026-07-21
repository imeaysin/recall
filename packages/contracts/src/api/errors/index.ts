import { HttpErrorCode } from "./http.errors"
import { FileErrorCode } from "./file.errors"
import { ContentErrorCode } from "./content.errors"
export * from "./http.errors"
export * from "./file.errors"
export * from "./content.errors"
export type DomainErrorCode = FileErrorCode | ContentErrorCode

export type ApiErrorCode = HttpErrorCode | DomainErrorCode

const API_ERROR_CODES = new Set<string>([
  ...Object.values(HttpErrorCode),
  ...Object.values(FileErrorCode),
  ...Object.values(ContentErrorCode),
])

export function isApiErrorCode(value: string): value is ApiErrorCode {
  return API_ERROR_CODES.has(value)
}
