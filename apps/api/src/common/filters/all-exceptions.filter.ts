import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common"
import { createLogger } from "@workspace/logger"
import type { Request, Response } from "express"
import { env } from "@workspace/config"
import {
  resolveExceptionMessage,
  resolveHttpStatus,
} from "./http-exception.utils"

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = createLogger("Exceptions")

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status = resolveHttpStatus(exception)
    const message = resolveExceptionMessage(exception)

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logServerError(request, exception)
    }

    response
      .status(status)
      .json(this.buildErrorBody(status, message, request, exception))
  }

  private logServerError(request: Request, exception: unknown) {
    this.logger.error(
      {
        method: request.method,
        url: request.url,
        err:
          exception instanceof Error
            ? exception
            : { message: String(exception) },
      },
      "unhandled server error"
    )
  }

  private buildErrorBody(
    status: number,
    message: string | string[],
    request: Request,
    exception: unknown
  ) {
    const body: Record<string, unknown> = {
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    }

    if (env.NODE_ENV === "development" && exception instanceof Error) {
      body.error = exception.name
    }

    return body
  }
}
