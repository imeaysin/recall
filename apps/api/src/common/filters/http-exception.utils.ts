import { HttpException, HttpStatus } from "@nestjs/common"
import {
  HttpErrorCode,
  type ApiErrorResponse,
  type ApiErrorCode,
  type ApiFieldError,
} from "@workspace/contracts"
import type { Request } from "express"
import { ZodValidationException } from "nestjs-zod"
import type { ZodIssue } from "zod"

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

export function resolveHttpStatus(exception: unknown): number {
  if (exception instanceof HttpException) {
    return exception.getStatus()
  }
  return HttpStatus.INTERNAL_SERVER_ERROR
}

function formatZodPath(path: PropertyKey[]): string {
  if (path.length === 0) return "body"

  return path.reduce<string>((formatted, segment, index) => {
    if (typeof segment === "number") {
      return `${formatted}[${segment}]`
    }

    return index === 0 ? String(segment) : `${formatted}.${String(segment)}`
  }, "")
}

function flattenZodIssues(issues: ZodIssue[]): ApiFieldError[] {
  return issues.map((issue) => ({
    field: formatZodPath(issue.path),
    message: issue.message,
  }))
}

function readResponseErrors(
  exception: HttpException
): ApiFieldError[] | undefined {
  const response = exception.getResponse()
  if (typeof response !== "object" || response === null) return undefined

  const { errors } = response as { errors?: unknown }
  if (!Array.isArray(errors) || errors.length === 0) return undefined

  if (
    errors.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "path" in item &&
        "message" in item
    )
  ) {
    return flattenZodIssues(errors as ZodIssue[])
  }

  return undefined
}

function readErrorCode(exception: HttpException): ApiErrorCode | undefined {
  if (typeof exception.cause !== "string" || exception.cause.length === 0) {
    return undefined
  }
  return exception.cause as ApiErrorCode
}

export function resolveErrorCode(
  exception: unknown,
  status: number
): ApiErrorCode {
  if (exception instanceof ZodValidationException) {
    return HttpErrorCode.VALIDATION_FAILED
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
  if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
    return INTERNAL_ERROR_MESSAGE
  }

  if (exception instanceof ZodValidationException) {
    return "Validation failed"
  }

  if (exception instanceof HttpException) {
    const response = exception.getResponse()

    if (typeof response === "string" && response.length > 0) {
      return response
    }

    if (
      typeof response === "object" &&
      response !== null &&
      "message" in response
    ) {
      const { message } = response as { message: string | string[] }
      if (Array.isArray(message)) {
        return message.join(", ")
      }
      if (typeof message === "string" && message.length > 0) {
        return message
      }
    }
  }

  return STATUS_TO_CODE[status] ?? HttpErrorCode.HTTP_ERROR
}

export function resolveFieldErrors(exception: unknown): ApiFieldError[] | null {
  if (exception instanceof ZodValidationException) {
    const zodError = exception.getZodError()
    if (zodError && typeof zodError === "object" && "issues" in zodError) {
      return flattenZodIssues((zodError as { issues: ZodIssue[] }).issues)
    }
  }

  if (exception instanceof HttpException) {
    return readResponseErrors(exception) ?? null
  }

  return null
}

export function buildErrorEnvelope(
  exception: unknown,
  status: number,
  request: Request
): ApiErrorResponse {
  return {
    success: false,
    statusCode: status,
    code: resolveErrorCode(exception, status),
    message: resolveClientMessage(exception, status),
    errors: resolveFieldErrors(exception),
    path: request.url,
    timestamp: new Date().toISOString(),
  }
}
