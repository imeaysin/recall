import type { ApiErrorCode } from "@workspace/contracts"

/**
 * Base exception class for all domain-level business rule violations.
 * Domain logic should ONLY throw subclasses of DomainException, never
 * standard NestJS HttpExceptions.
 */
export abstract class DomainException extends Error {
  abstract readonly errorCode: ApiErrorCode
  abstract readonly statusCode: number

  constructor(
    message: string,
    public readonly metadata?: Record<string, unknown>
  ) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
  }
}
