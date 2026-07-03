import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common"
import { createLogger, getRequestId } from "@workspace/logger"
import type { Request, Response } from "express"
import { buildErrorEnvelope, resolveHttpStatus } from "./http-exception.utils"

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = createLogger("Exceptions")

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status = resolveHttpStatus(exception)

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logServerError(request, exception)
    }

    response.status(status).json(buildErrorEnvelope(exception, status, request))
  }

  private logServerError(request: Request, exception: unknown) {
    this.logger.error(
      {
        requestId: getRequestId(),
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
}
