import type { z } from "zod"
import { loadRootEnvFile } from "./load-env"

loadRootEnvFile()

export function createEnv<T extends z.ZodTypeAny>(
  schema: T,
  buildDefaults: Partial<z.infer<T>>
): z.infer<T> {
  const isBuildPhase =
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.SKIP_ENV_VALIDATION === "true"

  const dataToValidate = isBuildPhase
    ? { ...buildDefaults, ...process.env }
    : process.env

  const result = schema.safeParse(dataToValidate)

  if (!result.success) {
    console.error(
      "❌ Invalid environment variables:",
      result.error.flatten().fieldErrors
    )
    throw new Error("Invalid environment variables")
  }

  return result.data
}
