import { createEnv } from "../validate"
import {
  emailEnvSchema,
  pickServerDefaults,
  type EmailEnv,
} from "../schemas/server"

/** Email delivery — used by `@workspace/email`. */
export const emailEnv = createEnv(
  emailEnvSchema,
  pickServerDefaults([
    "EMAIL_PROVIDER",
    "RESEND_API_KEY",
    "APP_NAME",
    "BETTER_AUTH_URL",
  ])
)

export function getEmailFromAddress(config: EmailEnv = emailEnv): string {
  if (config.EMAIL_FROM) return config.EMAIL_FROM
  const domain = new URL(config.BETTER_AUTH_URL).hostname
  return `${config.APP_NAME} <no-reply@${domain}>`
}

/** Builds the discriminated configuration object required by `@workspace/email`'s factory. */
export function getEmailProviderConfig() {
  if (emailEnv.EMAIL_PROVIDER === "resend") {
    return {
      provider: "resend" as const,
      apiKey: emailEnv.RESEND_API_KEY,
      fromAddress: getEmailFromAddress(),
      appName: emailEnv.APP_NAME,
    }
  }

  return { provider: "mock" as const }
}

export type { EmailEnv }
