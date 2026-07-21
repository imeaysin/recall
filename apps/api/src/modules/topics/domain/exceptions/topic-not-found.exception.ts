import { TopicErrorCode } from "@workspace/contracts"
import { DomainException } from "@/common/exceptions/domain.exception"

export class TopicNotFoundException extends DomainException {
  readonly errorCode = TopicErrorCode.TOPIC_NOT_FOUND
  readonly statusCode = 404

  constructor(message = "Topic not found") {
    super(message)
  }
}
