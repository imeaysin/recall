import { TopicErrorCode } from "@workspace/contracts"
import { DomainException } from "@/common/exceptions/domain.exception"

export class TopicNotUserCreatedException extends DomainException {
  readonly errorCode = TopicErrorCode.TOPIC_NOT_USER_CREATED
  readonly statusCode = 403

  constructor(message = "Only user-created topics can be deleted") {
    super(message)
  }
}
