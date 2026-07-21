import { TopicErrorCode } from "@workspace/contracts"
import { DomainException } from "@/common/exceptions/domain.exception"

export class TopicMergeInvalidException extends DomainException {
  readonly errorCode = TopicErrorCode.TOPIC_MERGE_INVALID
  readonly statusCode = 400

  constructor(message = "Topic merge is not allowed") {
    super(message)
  }
}
