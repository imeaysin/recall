import { ContentErrorCode } from "@workspace/contracts"
import { DomainException } from "@/common/exceptions/domain.exception"

export class InvalidContentUpdateException extends DomainException {
  readonly errorCode = ContentErrorCode.CONTENT_INVALID_UPDATE
  readonly statusCode = 400

  constructor(message = "At least one updatable field is required") {
    super(message)
  }
}
