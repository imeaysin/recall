import type { EmailConfig, EmailProvider } from "./types"
import { MockEmailAdapter } from "./adapters/mock"
import { ResendEmailAdapter } from "./adapters/resend"

export function createEmailProvider(config: EmailConfig): EmailProvider {
  switch (config.provider) {
    case "mock":
      return new MockEmailAdapter()
    case "resend":
      return new ResendEmailAdapter(config)
    default: {
      const _exhaustive: never = config
      throw new Error(`Unknown email provider: ${_exhaustive}`)
    }
  }
}
