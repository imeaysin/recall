import { env } from "@workspace/config"
import { getEmailProviderConfig } from "@workspace/config/email"
import { createEmailProvider } from "@workspace/email"
import { WEB_ACCEPT_INVITATION_PATH_PREFIX } from "../access"

const emailProvider = createEmailProvider(getEmailProviderConfig())

export async function sendVerificationEmail(input: {
  readonly to: string
  readonly url: string
}) {
  await emailProvider.sendVerificationEmail(input.to, input.url)
}

export async function sendResetPasswordEmail(input: {
  readonly to: string
  readonly url: string
}) {
  await emailProvider.sendResetPasswordEmail(input.to, input.url)
}

export async function sendOrganizationInvitationEmail(input: {
  readonly to: string
  readonly organizationName: string
  readonly inviterName: string
  readonly invitationId: string
}) {
  const inviteLink = `${env.CLIENT_URL}${WEB_ACCEPT_INVITATION_PATH_PREFIX}/${input.invitationId}`
  await emailProvider.sendOrganizationInvitationEmail(
    input.to,
    input.organizationName,
    input.inviterName,
    inviteLink
  )
}

export async function sendTwoFactorOtp(input: {
  readonly to: string
  readonly otp: string
}) {
  await emailProvider.sendOtpEmail(input.to, input.otp, "sign-in")
}
