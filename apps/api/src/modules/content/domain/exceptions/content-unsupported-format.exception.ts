import { ContentErrorCode } from "@workspace/contracts"
import { DomainException } from "@/common/exceptions/domain.exception"

export class ContentUnsupportedFormatException extends DomainException {
  readonly errorCode = ContentErrorCode.UNSUPPORTED_FORMAT
  readonly statusCode = 400

  constructor(message = "Only application/pdf uploads are supported") {
    super(message)
  }
}
