export type {
  EmailProvider,
  EmailConfig,
  MockEmailConfig,
  ResendEmailConfig,
  SendLinkEmailInput,
  SendOtpEmailInput,
} from "./types"
export { createEmailProvider } from "./factory"

export {
  EmailChangedEmail,
  EmailVerificationEmail,
  MagicLinkEmail,
  NewDeviceEmail,
  OtpEmail,
  PasswordChangedEmail,
  ResetPasswordEmail,
} from "./templates"
