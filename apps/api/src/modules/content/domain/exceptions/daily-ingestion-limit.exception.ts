import { ContentErrorCode } from "@workspace/contracts"
import { DomainException } from "@/common/exceptions/domain.exception"

export class DailyIngestionLimitException extends DomainException {
  readonly errorCode = ContentErrorCode.DAILY_LIMIT_REACHED
  readonly statusCode = 429

  constructor(message = "Daily ingestion limit reached") {
    super(message)
  }
}
