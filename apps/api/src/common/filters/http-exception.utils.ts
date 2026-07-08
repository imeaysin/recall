import { HttpException, HttpStatus } from "@nestjs/common"
import {
  FileErrorCode,
  HttpErrorCode,
  isApiErrorCode,
  type ApiErrorResponse,
  type ApiErrorCode,
  type ApiFieldError,
} from "@workspace/contracts"
import { StorageError, type StorageErrorCode } from "@workspace/storage"
import { getRequestId } from "@workspace/logger"
import type { Request } from "express"
import { ZodValidationException } from "nestjs-zod"
import { z, ZodError } from "zod"

const STATUS_TO_CODE: Record<number, HttpErrorCode> = {
  [HttpStatus.BAD_REQUEST]: HttpErrorCode.BAD_REQUEST,
  [HttpStatus.UNAUTHORIZED]: HttpErrorCode.UNAUTHORIZED,
  [HttpStatus.FORBIDDEN]: HttpErrorCode.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: HttpErrorCode.NOT_FOUND,
  [HttpStatus.CONFLICT]: HttpErrorCode.CONFLICT,
  [HttpStatus.UNPROCESSABLE_ENTITY]: HttpErrorCode.UNPROCESSABLE_ENTITY,
  [HttpStatus.TOO_MANY_REQUESTS]: HttpErrorCode.TOO_MANY_REQUESTS,
  [HttpStatus.INTERNAL_SERVER_ERROR]: HttpErrorCode.INTERNAL_SERVER_ERROR,
}

const INTERNAL_ERROR_MESSAGE = "An unexpected server error occurred."

const STORAGE_STATUS: Record<StorageErrorCode, number> = {
  INVALID_PATH: HttpStatus.BAD_REQUEST,
  FILE_NOT_FOUND: HttpStatus.NOT_FOUND,
  UNSUPPORTED_OPERATION: HttpStatus.BAD_REQUEST,
  UPLOAD_FAILED: HttpStatus.INTERNAL_SERVER_ERROR,
  DELETE_FAILED: HttpStatus.INTERNAL_SERVER_ERROR,
  COPY_FAILED: HttpStatus.INTERNAL_SERVER_ERROR,
  MOVE_FAILED: HttpStatus.INTERNAL_SERVER_ERROR,
  LIST_FAILED: HttpStatus.INTERNAL_SERVER_ERROR,
  PROVIDER_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
}

const STORAGE_DOMAIN_CODE: Partial<Record<StorageErrorCode, FileErrorCode>> = {
  INVALID_PATH: FileErrorCode.INVALID_PATH,
  FILE_NOT_FOUND: FileErrorCode.NOT_FOUND,
}

export function resolveHttpStatus(exception: unknown): number {
  if (exception instanceof HttpException) return exception.getStatus()
  if (exception instanceof StorageError) return STORAGE_STATUS[exception.code]

  return HttpStatus.INTERNAL_SERVER_ERROR
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function flattenZodIssues(issues: z.core.$ZodIssue[]): ApiFieldError[] {
  return issues.map((issue) => ({
    field: z.core.toDotPath(issue.path) || "body",
    message: issue.message,
  }))
}

function isZodIssue(value: unknown): value is z.core.$ZodIssue {
  return (
    typeof value === "object" &&
    value !== null &&
    "path" in value &&
    Array.isArray(value.path) &&
    "message" in value &&
    typeof value.message === "string"
  )
}

function readResponseErrors(
  exception: HttpException
): ApiFieldError[] | undefined {
  const response = exception.getResponse()
  if (!isRecord(response)) return undefined

  const { errors } = response
  if (!Array.isArray(errors) || errors.length === 0) return undefined

  if (errors.every(isZodIssue)) return flattenZodIssues(errors)

  return undefined
}

function readErrorCode(exception: HttpException): ApiErrorCode | undefined {
  const { cause } = exception
  if (typeof cause !== "string" || cause.length === 0) {
    return undefined
  }
  return isApiErrorCode(cause) ? cause : undefined
}

function readHttpExceptionMessage(response: unknown): string | undefined {
  if (typeof response === "string" && response.length > 0) return response
  if (!isRecord(response) || !("message" in response)) return undefined

  const { message } = response
  if (Array.isArray(message)) {
    return message
      .filter((item): item is string => typeof item === "string")
      .join(", ")
  }
  if (typeof message === "string" && message.length > 0) return message

  return undefined
}

export function resolveErrorCode(
  exception: unknown,
  status: number
): ApiErrorCode {
  if (exception instanceof ZodValidationException) {
    return HttpErrorCode.VALIDATION_FAILED
  }

  if (exception instanceof StorageError) {
    return (
      STORAGE_DOMAIN_CODE[exception.code] ??
      STATUS_TO_CODE[status] ??
      HttpErrorCode.HTTP_ERROR
    )
  }

  if (exception instanceof HttpException) {
    const code = readErrorCode(exception)
    if (code) return code
  }

  return STATUS_TO_CODE[status] ?? HttpErrorCode.HTTP_ERROR
}

export function resolveClientMessage(
  exception: unknown,
  status: number
): string {
  if (status >= HttpStatus.INTERNAL_SERVER_ERROR) return INTERNAL_ERROR_MESSAGE
  if (exception instanceof ZodValidationException) return "Validation failed"
  if (exception instanceof StorageError) return exception.message

  if (exception instanceof HttpException) {
    const message = readHttpExceptionMessage(exception.getResponse())
    if (message) return message
  }

  return "An unexpected error occurred."
}

export function resolveFieldErrors(exception: unknown): ApiFieldError[] | null {
  if (exception instanceof ZodValidationException) {
    const zodError = exception.getZodError()
    if (zodError instanceof ZodError) return flattenZodIssues(zodError.issues)
  }

  if (exception instanceof HttpException) {
    return readResponseErrors(exception) ?? null
  }

  return null
}

export function buildErrorEnvelope(
  exception: unknown,
  status: number,
  request: Pick<Request, "url">
): ApiErrorResponse {
  const requestId = getRequestId()

  return {
    success: false,
    statusCode: status,
    code: resolveErrorCode(exception, status),
    message: resolveClientMessage(exception, status),
    errors: resolveFieldErrors(exception),
    path: request.url,
    ...(requestId ? { requestId } : {}),
    timestamp: new Date().toISOString(),
  }
}
