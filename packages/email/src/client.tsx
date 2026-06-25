import { Resend } from "resend"
import { emailEnv, getEmailFromAddress } from "@workspace/config/email"
import { WelcomeEmail } from "./templates/welcome"
import { VerificationEmail } from "./templates/verification-email"
import { ResetPasswordEmail } from "./templates/reset-password"
import { MagicLinkEmail } from "./templates/magic-link"
import { OtpEmail } from "./templates/otp"
import { OrganizationInvitationEmail } from "./templates/organization-invitation"

export const resend = new Resend(emailEnv.RESEND_API_KEY)

const FROM_ADDRESS = getEmailFromAddress()

export async function sendWelcomeEmail(to: string, name: string) {
  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Welcome to ${emailEnv.APP_NAME}!`,
    react: <WelcomeEmail name={name} />,
  })
}

export async function sendVerificationEmail(to: string, url: string) {
  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Verify your email",
    react: <VerificationEmail url={url} />,
  })
}

export async function sendResetPasswordEmail(to: string, url: string) {
  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Reset your password",
    react: <ResetPasswordEmail url={url} />,
  })
}

export async function sendMagicLinkEmail(to: string, url: string) {
  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Your sign-in link",
    react: <MagicLinkEmail url={url} />,
  })
}

export async function sendOtpEmail(
  to: string,
  otp: string,
  type: "sign-in" | "email-verification" | "forget-password" | "change-email"
) {
  const subject =
    type === "sign-in" ? "Your sign-in code" : "Verify your email"

  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    react: <OtpEmail otp={otp} />,
  })
}

export async function sendOrganizationInvitationEmail(
  to: string,
  organizationName: string,
  inviterName: string,
  url: string
) {
  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Join ${organizationName}`,
    react: (
      <OrganizationInvitationEmail
        organizationName={organizationName}
        inviterName={inviterName}
        url={url}
      />
    ),
  })
}
