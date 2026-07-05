import type { EmailProvider } from "../types"

type DevEmailPayload = {
  to: string
  subject: string
  lines: string[]
}

export class MockEmailAdapter implements EmailProvider {
  private log(payload: DevEmailPayload) {
    const body = payload.lines.join("\n")
    console.info(
      `[email:dev] To: ${payload.to}\nSubject: ${payload.subject}\n${body}\n---`
    )
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    this.log({ to, subject: "Welcome!", lines: [`Welcome, ${name}!`] })
  }

  async sendVerificationEmail(to: string, url: string): Promise<void> {
    this.log({
      to,
      subject: "Verify your email",
      lines: [`Verification link: ${url}`],
    })
  }

  async sendResetPasswordEmail(to: string, url: string): Promise<void> {
    this.log({
      to,
      subject: "Reset your password",
      lines: [`Reset link: ${url}`],
    })
  }

  async sendMagicLinkEmail(to: string, url: string): Promise<void> {
    this.log({
      to,
      subject: "Your sign-in link",
      lines: [`Magic link: ${url}`],
    })
  }

  async sendOtpEmail(to: string, otp: string, type: string): Promise<void> {
    const subject =
      type === "sign-in" ? "Your sign-in code" : "Verify your email"
    this.log({ to, subject, lines: [`OTP (${type}): ${otp}`] })
  }

  async sendOrganizationInvitationEmail(
    to: string,
    org: string,
    inviter: string,
    url: string
  ): Promise<void> {
    this.log({ to, subject: `Join ${org}`, lines: [`Accept: ${url}`] })
  }
}
