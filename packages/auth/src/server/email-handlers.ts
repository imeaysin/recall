import { getEmailProviderConfig } from "@workspace/config/email"
import { createEmailProvider } from "@workspace/email"

const emailProvider = createEmailProvider(getEmailProviderConfig())

export async function sendVerificationEmail(input: {
  readonly to: string
  readonly url: string
}) {
  await emailProvider.sendVerificationEmail({
    to: input.to,
    url: input.url,
  })
}

export async function sendResetPasswordEmail(input: {
  readonly to: string
  readonly url: string
}) {
  await emailProvider.sendResetPasswordEmail({
    to: input.to,
    url: input.url,
  })
}

export async function sendTwoFactorOtp(input: {
  readonly to: string
  readonly otp: string
}) {
  await emailProvider.sendOtpEmail({
    to: input.to,
    otp: input.otp,
    type: "sign-in",
  })
}
