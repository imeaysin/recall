import pino, { type Logger, type LoggerOptions } from "pino"

/** Nest internals that spam the console on every boot — kept at debug. */
const NEST_VERBOSE_CONTEXTS = new Set([
  "InstanceLoader",
  "RoutesResolver",
  "RouterExplorer",
  "NestFactory",
])

function resolveLogLevel(): pino.LevelWithSilent {
  const configured = process.env.LOG_LEVEL?.trim()
  if (configured) return configured as pino.LevelWithSilent
  return "info"
}

function isPrettyEnabled(): boolean {
  const flag = process.env.LOG_PRETTY?.trim()
  if (flag === "true") return true
  if (flag === "false") return false
  if (process.env.CI === "true") return false
  if (process.env.JEST_WORKER_ID !== undefined) return false
  return process.env.NODE_ENV !== "production"
}

function createRootLogger(): Logger {
  const level = resolveLogLevel()

  if (isPrettyEnabled()) {
    // https://getpino.io/#/docs/pretty — transport loads pino-pretty in a worker thread
    return pino({
      level,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
          singleLine: true,
          messageFormat: "{if name}[{name}] {end}{msg}",
        },
      },
    })
  }

  const options: LoggerOptions = {
    level,
    // ISO timestamps; structured JSON for production / log aggregators
    timestamp: pino.stdTimeFunctions.isoTime,
  }

  return pino(options)
}

const root = createRootLogger()

/** Named child logger for a module or context. */
export function createLogger(name: string): Logger {
  return root.child({ name })
}

export function isNestVerboseContext(context?: string): boolean {
  return context != null && NEST_VERBOSE_CONTEXTS.has(context)
}

export type { Logger }
export { root as logger }
