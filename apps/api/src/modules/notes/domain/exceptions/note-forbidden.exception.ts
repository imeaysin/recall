import { NoteErrorCode } from "@workspace/contracts"
import { DomainException } from "@/common/exceptions/domain.exception"

export class NoteForbiddenException extends DomainException {
  readonly errorCode = NoteErrorCode.FORBIDDEN
  readonly statusCode = 403

  constructor(
    message = "Access denied to note",
    metadata?: Record<string, unknown>
  ) {
    super(message, metadata)
  }
}
