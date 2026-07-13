import { NoteErrorCode } from "@workspace/contracts"
import { DomainException } from "@/common/exceptions/domain.exception"

export class NoteNotFoundException extends DomainException {
  readonly errorCode = NoteErrorCode.NOT_FOUND
  readonly statusCode = 404

  constructor(message = "Note not found", metadata?: Record<string, unknown>) {
    super(message, metadata)
  }
}
