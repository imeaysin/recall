export type SendLinkEmailInput = {
  readonly to: string
  readonly url: string
  readonly expirationMinutes?: number
}

export type SendOtpEmailInput = {
  readonly to: string
  readonly otp: string
  readonly type:
    "sign-in" | "email-verification" | "forget-password" | "change-email"
  readonly expirationMinutes?: number
}

export type EmailProvider = {
  sendVerificationEmail(input: SendLinkEmailInput): Promise<void>
  sendResetPasswordEmail(input: SendLinkEmailInput): Promise<void>
  sendMagicLinkEmail(input: SendLinkEmailInput): Promise<void>
  sendOtpEmail(input: SendOtpEmailInput): Promise<void>
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
