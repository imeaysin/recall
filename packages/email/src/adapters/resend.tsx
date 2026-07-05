import * as React from "react"
import { Resend } from "resend"
import type { EmailProvider, ResendEmailConfig } from "../types"
import { WelcomeEmail } from "../templates/welcome"
import { VerificationEmail } from "../templates/verification-email"
import { ResetPasswordEmail } from "../templates/reset-password"
import { MagicLinkEmail } from "../templates/magic-link"
import { OtpEmail } from "../templates/otp"
import { OrganizationInvitationEmail } from "../templates/organization-invitation"

export class ResendEmailAdapter implements EmailProvider {
  private readonly client: Resend
  private readonly config: ResendEmailConfig

  constructor(config: ResendEmailConfig) {
    this.client = new Resend(config.apiKey)
    this.config = config
  }

  private async send(to: string, subject: string, react: React.ReactElement) {
    await this.client.emails.send({
      from: this.config.fromAddress,
      to,
      subject,
      react,
    })
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    await this.send(
      to,
      `Welcome to ${this.config.appName}!`,
      <WelcomeEmail name={name} />
    )
  }

  async sendVerificationEmail(to: string, url: string): Promise<void> {
    await this.send(to, "Verify your email", <VerificationEmail url={url} />)
  }

  async sendResetPasswordEmail(to: string, url: string): Promise<void> {
    await this.send(to, "Reset your password", <ResetPasswordEmail url={url} />)
  }

  async sendMagicLinkEmail(to: string, url: string): Promise<void> {
    await this.send(to, "Your sign-in link", <MagicLinkEmail url={url} />)
  }

  async sendOtpEmail(
    to: string,
    otp: string,
    type: "sign-in" | "email-verification" | "forget-password" | "change-email"
  ): Promise<void> {
    const subject =
      type === "sign-in" ? "Your sign-in code" : "Verify your email"
    await this.send(to, subject, <OtpEmail otp={otp} />)
  }

  async sendOrganizationInvitationEmail(
    to: string,
    org: string,
    inviter: string,
    url: string
  ): Promise<void> {
    await this.send(
      to,
      `Join ${org}`,
      <OrganizationInvitationEmail
        organizationName={org}
        inviterName={inviter}
        url={url}
      />
    )
  }
}
