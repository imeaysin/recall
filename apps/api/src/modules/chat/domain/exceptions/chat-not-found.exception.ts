import { ChatErrorCode } from "@workspace/contracts"
import { DomainException } from "@/common/exceptions/domain.exception"

export class ChatNotFoundException extends DomainException {
  readonly errorCode = ChatErrorCode.CHAT_NOT_FOUND
  readonly statusCode = 404

  constructor(message = "Chat not found") {
    super(message)
  }
}
