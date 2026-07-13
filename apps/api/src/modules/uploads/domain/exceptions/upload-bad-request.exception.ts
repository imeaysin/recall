import { FileErrorCode } from "@workspace/contracts"
import { DomainException } from "@/common/exceptions/domain.exception"

export class UploadBadRequestException extends DomainException {
  readonly errorCode = FileErrorCode.REQUIRED
  readonly statusCode = 400

  constructor(
    message = "File is required",
    metadata?: Record<string, unknown>
  ) {
    super(message, metadata)
  }
}
