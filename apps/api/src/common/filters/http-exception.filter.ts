import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common"
import { HttpAdapterHost } from "@nestjs/core"
import {
  HttpErrorCode,
  isApiErrorCode,
  type ApiErrorCode,
  type ApiFieldError,
} from "@workspace/contracts"
import { z } from "zod"
import { createErrorEnvelope } from "./error-envelope.util"

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
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

function flattenZodIssues(issues: z.core.$ZodIssue[]): ApiFieldError[] {
  return issues.map((issue) => ({
    field: z.core.toDotPath(issue.path) || "body",
    message: issue.message,
  }))
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost
    const ctx = host.switchToHttp()

    const request = ctx.getRequest()
    const response = ctx.getResponse()

    const status = exception.getStatus()

    // Extract code
    let code: ApiErrorCode = STATUS_TO_CODE[status] || HttpErrorCode.HTTP_ERROR
    const { cause } = exception
    if (
      typeof cause === "string" &&
      cause.length > 0 &&
      isApiErrorCode(cause)
    ) {
      code = cause
    }

    // Extract message
    let message = "An unexpected error occurred."
    const httpResponse = exception.getResponse()
    if (typeof httpResponse === "string" && httpResponse.length > 0) {
      message = httpResponse
    } else if (isRecord(httpResponse) && "message" in httpResponse) {
      if (Array.isArray(httpResponse.message)) {
        message = httpResponse.message
          .filter((item): item is string => typeof item === "string")
          .join(", ")
      } else if (
        typeof httpResponse.message === "string" &&
        httpResponse.message.length > 0
      ) {
        message = httpResponse.message
      }
    }

    // Extract errors
    let errors: ApiFieldError[] | null = null
    if (
      isRecord(httpResponse) &&
      Array.isArray(httpResponse.errors) &&
      httpResponse.errors.length > 0
    ) {
      if (httpResponse.errors.every(isZodIssue)) {
        errors = flattenZodIssues(httpResponse.errors)
      }
    }

    const envelope = createErrorEnvelope({
      status,
      code,
      message,
      errors,
      path: httpAdapter.getRequestUrl(request),
    })

    httpAdapter.reply(response, envelope, status)
  }
}
