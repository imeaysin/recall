import { ContentErrorCode } from "@workspace/contracts"
import { DomainException } from "@/common/exceptions/domain.exception"

export class ContentTrashNotFoundException extends DomainException {
  readonly errorCode = ContentErrorCode.CONTENT_TRASH_NOT_FOUND
  readonly statusCode = 404

  constructor(message = "Trash item not found") {
    super(message)
  }
}
