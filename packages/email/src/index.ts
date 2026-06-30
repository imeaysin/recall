export {
  resend,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendMagicLinkEmail,
  sendOtpEmail,
  sendOrganizationInvitationEmail,
} from "./client"
export { WelcomeEmail } from "./templates/welcome"
export { VerificationEmail } from "./templates/verification-email"
export { VerificationEmail as EmailVerificationEmail } from "./templates/verification-email"
export { ResetPasswordEmail } from "./templates/reset-password"
export { MagicLinkEmail } from "./templates/magic-link"
export { OtpEmail } from "./templates/otp"
export { OrganizationInvitationEmail } from "./templates/organization-invitation"
export { EmailChangedEmail } from "./templates/email-changed"
export { PasswordChangedEmail } from "./templates/password-changed"
export { NewDeviceEmail } from "./templates/new-device"
