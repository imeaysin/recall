import { ContentErrorCode } from "@workspace/contracts"
import { DomainException } from "@/common/exceptions/domain.exception"

export class AiQuotaExceededException extends DomainException {
  readonly errorCode = ContentErrorCode.AI_QUOTA_EXCEEDED
  readonly statusCode = 429

  constructor(message = "AI provider daily quota reached") {
    super(message)
  }
}
