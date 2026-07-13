import { HttpErrorCode } from "@workspace/contracts"
import { DomainException } from "@/common/exceptions/domain.exception"

export class UploadForbiddenException extends DomainException {
  readonly errorCode = HttpErrorCode.FORBIDDEN
  readonly statusCode = 403

  constructor(
    message = "Access denied to upload",
    metadata?: Record<string, unknown>
  ) {
    super(message, metadata)
  }
}
