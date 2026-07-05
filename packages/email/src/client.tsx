import { Resend } from "resend"
import {
  emailEnv,
  getEmailFromAddress,
  isResendConfigured,
} from "@workspace/config/email"
import { logDevEmail } from "./dev-log"
import { WelcomeEmail } from "./templates/welcome"
import { VerificationEmail } from "./templates/verification-email"
import { ResetPasswordEmail } from "./templates/reset-password"
import { MagicLinkEmail } from "./templates/magic-link"
import { OtpEmail } from "./templates/otp"
import { OrganizationInvitationEmail } from "./templates/organization-invitation"

const FROM_ADDRESS = getEmailFromAddress()

function getResendClient() {
  if (!isResendConfigured()) {
    throw new Error("Resend is not configured")
  }
  return new Resend(emailEnv.RESEND_API_KEY)
}

import * as React from "react"
import { ReactElement } from "react"

export const resend = isResendConfigured() ? getResendClient() : null

async function sendEmail(options: {
  to: string
  subject: string
  react: ReactElement
  lines: string[]
}) {
  if (!resend) {
    logDevEmail({
      to: options.to,
      subject: options.subject,
      lines: options.lines,
    })
    return
  }

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: options.to,
    subject: options.subject,
    react: options.react,
  })
}

export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail({
    to,
    subject: `Welcome to ${emailEnv.APP_NAME}!`,
    react: <WelcomeEmail name={name} />,
    lines: [`Welcome, ${name}!`],
  })
}

export async function sendVerificationEmail(to: string, url: string) {
  return sendEmail({
    to,
    subject: "Verify your email",
    react: <VerificationEmail url={url} />,
    lines: [`Verification link: ${url}`],
  })
}

export async function sendResetPasswordEmail(to: string, url: string) {
  return sendEmail({
    to,
    subject: "Reset your password",
    react: <ResetPasswordEmail url={url} />,
    lines: [`Reset link: ${url}`],
  })
}

export async function sendMagicLinkEmail(to: string, url: string) {
  return sendEmail({
    to,
    subject: "Your sign-in link",
    react: <MagicLinkEmail url={url} />,
    lines: [`Magic link: ${url}`],
  })
}

export async function sendOtpEmail(
  to: string,
  otp: string,
  type: "sign-in" | "email-verification" | "forget-password" | "change-email"
) {
  const subject = type === "sign-in" ? "Your sign-in code" : "Verify your email"
  return sendEmail({
    to,
    subject,
    react: <OtpEmail otp={otp} />,
    lines: [`OTP (${type}): ${otp}`],
  })
}

export async function sendOrganizationInvitationEmail(
  to: string,
  organizationName: string,
  inviterName: string,
  url: string
) {
  return sendEmail({
    to,
    subject: `Join ${organizationName}`,
    react: (
      <OrganizationInvitationEmail
        organizationName={organizationName}
        inviterName={inviterName}
        url={url}
      />
    ),
    lines: [
      `${inviterName} invited you to ${organizationName}.`,
      `Accept: ${url}`,
    ],
  })
}
