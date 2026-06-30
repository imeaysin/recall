import pino, { type Logger } from "pino"

function resolveLogLevel(): pino.LevelWithSilent {
  const configured = process.env.LOG_LEVEL
  if (configured) return configured as pino.LevelWithSilent
  return process.env.NODE_ENV === "production" ? "info" : "debug"
}

const root = pino({ level: resolveLogLevel() })

/** Named child logger for a module or context. */
export function createLogger(name: string): Logger {
  return root.child({ name })
}

export type { Logger }
export { root as logger }
