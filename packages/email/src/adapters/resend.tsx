import * as React from "react"
import { Resend } from "resend"
import {
  EmailVerificationEmail,
  MagicLinkEmail,
  OtpEmail,
  ResetPasswordEmail,
} from "../templates"
import type {
  EmailProvider,
  ResendEmailConfig,
  SendLinkEmailInput,
  SendOtpEmailInput,
} from "../types"

export class ResendEmailAdapter implements EmailProvider {
  private readonly client: Resend
  private readonly config: ResendEmailConfig

  constructor(config: ResendEmailConfig) {
    this.client = new Resend(config.apiKey)
    this.config = config
  }

  private get appName() {
    return this.config.appName
  }

  private async send(
    to: string,
    subject: string,
    react: React.ReactElement
  ): Promise<void> {
    await this.client.emails.send({
      from: this.config.fromAddress,
      to,
      subject,
      react,
    })
  }

  async sendVerificationEmail(input: SendLinkEmailInput): Promise<void> {
    await this.send(
      input.to,
      "Verify your email",
      <EmailVerificationEmail
        url={input.url}
        email={input.to}
        appName={this.appName}
        expirationMinutes={input.expirationMinutes}
      />
    )
  }

  async sendResetPasswordEmail(input: SendLinkEmailInput): Promise<void> {
    await this.send(
      input.to,
      "Reset your password",
      <ResetPasswordEmail
        url={input.url}
        email={input.to}
        appName={this.appName}
        expirationMinutes={input.expirationMinutes}
      />
    )
  }

  async sendMagicLinkEmail(input: SendLinkEmailInput): Promise<void> {
    await this.send(
      input.to,
      "Your sign-in link",
      <MagicLinkEmail
        url={input.url}
        email={input.to}
        appName={this.appName}
        expirationMinutes={input.expirationMinutes}
      />
    )
  }

  async sendOtpEmail(input: SendOtpEmailInput): Promise<void> {
    await this.send(
      input.to,
      input.type === "sign-in" ? "Your sign-in code" : "Verify your email",
      <OtpEmail
        verificationCode={input.otp}
        email={input.to}
        appName={this.appName}
        expirationMinutes={input.expirationMinutes}
      />
    )
  }
}
