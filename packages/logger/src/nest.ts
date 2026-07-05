import type { LoggerService } from "@nestjs/common"
import { createLogger, isNestVerboseContext } from "./index"

function formatMessage(message: unknown): string {
  if (typeof message === "string") return message
  if (message instanceof Error) return message.message
  try {
    return JSON.stringify(message)
  } catch {
    return String(message)
  }
}

/** Routes NestJS framework logs through `@workspace/logger` (pino). */
export class NestLoggerService implements LoggerService {
  private getLogger(context?: string) {
    return createLogger(context ?? "Nest")
  }

  log(message: unknown, context?: string): void {
    const logger = this.getLogger(context)
    const msg = formatMessage(message)
    if (isNestVerboseContext(context)) {
      logger.debug(msg)
      return
    }
    logger.info(msg)
  }

  error(message: unknown, stack?: string, context?: string): void {
    const logger = this.getLogger(context)
    const err = message instanceof Error ? message : undefined
    logger.error(
      {
        err,
        stack: stack ?? err?.stack,
      },
      formatMessage(message)
    )
  }

  warn(message: unknown, context?: string): void {
    this.getLogger(context).warn(formatMessage(message))
  }

  debug(message: unknown, context?: string): void {
    this.getLogger(context).debug(formatMessage(message))
  }

  verbose(message: unknown, context?: string): void {
    this.getLogger(context).trace(formatMessage(message))
  }

  fatal(message: unknown, context?: string): void {
    this.getLogger(context).fatal(formatMessage(message))
  }

  setLogLevels(_levels: unknown): void {
    // Level is controlled by LOG_LEVEL / NODE_ENV on the root pino instance.
  }
}
