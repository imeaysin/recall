import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from "@nestjs/common"
import { HttpAdapterHost } from "@nestjs/core"
import { ZodValidationException } from "nestjs-zod"
import { HttpErrorCode, type ApiFieldError } from "@workspace/contracts"
import { z, ZodError } from "zod"
import { createErrorEnvelope } from "./error-envelope.util"

function flattenZodIssues(issues: z.core.$ZodIssue[]): ApiFieldError[] {
  return issues.map((issue) => ({
    field: z.core.toDotPath(issue.path) || "body",
    message: issue.message,
  }))
}

@Catch(ZodValidationException)
export class ZodValidationExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: ZodValidationException, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost
    const ctx = host.switchToHttp()

    const request = ctx.getRequest()
    const response = ctx.getResponse()

    const zodError = exception.getZodError()
    const errors =
      zodError instanceof ZodError ? flattenZodIssues(zodError.issues) : null

    const status = HttpStatus.BAD_REQUEST

    const envelope = createErrorEnvelope({
      status,
      code: HttpErrorCode.VALIDATION_FAILED,
      message: "Validation failed",
      errors,
      path: httpAdapter.getRequestUrl(request),
    })

    httpAdapter.reply(response, envelope, status)
  }
}
