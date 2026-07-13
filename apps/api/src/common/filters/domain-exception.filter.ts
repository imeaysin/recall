import { ExceptionFilter, Catch, ArgumentsHost } from "@nestjs/common"
import { HttpAdapterHost } from "@nestjs/core"
import { DomainException } from "../exceptions/domain.exception"
import { createErrorEnvelope } from "./error-envelope.util"

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: DomainException, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost
    const ctx = host.switchToHttp()

    const request = ctx.getRequest()
    const response = ctx.getResponse()

    const envelope = createErrorEnvelope({
      status: exception.statusCode,
      code: exception.errorCode,
      message: exception.message,
      path: httpAdapter.getRequestUrl(request),
    })

    httpAdapter.reply(response, envelope, exception.statusCode)
  }
}
