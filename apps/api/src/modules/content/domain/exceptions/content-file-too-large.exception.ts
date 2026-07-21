import { ContentErrorCode } from "@workspace/contracts"
import { DomainException } from "@/common/exceptions/domain.exception"

export class ContentFileTooLargeException extends DomainException {
  readonly errorCode = ContentErrorCode.FILE_TOO_LARGE
  readonly statusCode = 413

  constructor(message = "PDF exceeds the configured size limit") {
    super(message)
  }
}
