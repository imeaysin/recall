import { TopicErrorCode } from "@workspace/contracts"
import { DomainException } from "@/common/exceptions/domain.exception"

export class TopicRootProtectedException extends DomainException {
  readonly errorCode = TopicErrorCode.TOPIC_ROOT_PROTECTED
  readonly statusCode = 403

  constructor(message = "The library root topic cannot be modified") {
    super(message)
  }
}
