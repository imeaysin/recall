import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from "@nestjs/common"
import { HttpAdapterHost } from "@nestjs/core"
import { StorageError, type StorageErrorCode } from "@workspace/storage"
import {
  FileErrorCode,
  HttpErrorCode,
  type ApiErrorCode,
} from "@workspace/contracts"
import { createErrorEnvelope } from "./error-envelope.util"

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

const STORAGE_DOMAIN_CODE: Partial<Record<StorageErrorCode, ApiErrorCode>> = {
  INVALID_PATH: FileErrorCode.INVALID_PATH,
  FILE_NOT_FOUND: FileErrorCode.NOT_FOUND,
}

@Catch(StorageError)
export class StorageExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: StorageError, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost
    const ctx = host.switchToHttp()

    const request = ctx.getRequest()
    const response = ctx.getResponse()

    const status =
      STORAGE_STATUS[exception.code] || HttpStatus.INTERNAL_SERVER_ERROR
    const code =
      STORAGE_DOMAIN_CODE[exception.code] || HttpErrorCode.INTERNAL_SERVER_ERROR

    const envelope = createErrorEnvelope({
      status,
      code,
      message: exception.message,
      path: httpAdapter.getRequestUrl(request),
    })

    httpAdapter.reply(response, envelope, status)
  }
}
