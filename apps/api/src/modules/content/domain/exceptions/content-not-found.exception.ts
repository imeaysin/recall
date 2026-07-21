import { ContentErrorCode } from "@workspace/contracts"
import { DomainException } from "@/common/exceptions/domain.exception"

export class ContentNotFoundException extends DomainException {
  readonly errorCode = ContentErrorCode.CONTENT_NOT_FOUND
  readonly statusCode = 404

  constructor(message = "Content not found") {
    super(message)
  }
}
