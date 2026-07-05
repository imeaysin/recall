export type EmailProvider = {
  sendWelcomeEmail(to: string, name: string): Promise<void>
  sendVerificationEmail(to: string, url: string): Promise<void>
  sendResetPasswordEmail(to: string, url: string): Promise<void>
  sendMagicLinkEmail(to: string, url: string): Promise<void>
  sendOtpEmail(
    to: string,
    otp: string,
    type: "sign-in" | "email-verification" | "forget-password" | "change-email"
  ): Promise<void>
  sendOrganizationInvitationEmail(
    to: string,
    organizationName: string,
    inviterName: string,
    url: string
  ): Promise<void>
}

export type MockEmailConfig = {
  provider: "mock"
}

export type ResendEmailConfig = {
  provider: "resend"
  apiKey: string
  fromAddress: string
  appName: string
}

export type EmailConfig = MockEmailConfig | ResendEmailConfig
