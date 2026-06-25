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

export type { EmailEnv }
