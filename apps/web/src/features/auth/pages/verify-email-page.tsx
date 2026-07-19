import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { routes } from "@/config/routes"
import { AuthPageBody } from "@/features/auth/components/auth-page-body"
import { AuthPageHeader } from "@/features/auth/components/auth-page-header"
import { resendVerificationEmail } from "@/features/auth/lib/resend-verification-email"

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get("email")
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  async function handleResend() {
    if (!email) {
      setStatusMessage("Enter your email on the sign-up form to resend.")
      return
    }

    setIsSending(true)
    setStatusMessage(null)
    const result = await resendVerificationEmail(email)
    setIsSending(false)
    setStatusMessage(result.message)
  }

  return (
    <AuthPageBody
      footer={
        <Link
          className="text-foreground underline underline-offset-2 transition-colors hover:text-foreground/80"
          to={routes.signIn}
        >
          Back to sign in
        </Link>
      }
    >
      <AuthPageHeader
        description={
          email
            ? `We sent a verification link to ${email}.`
            : "Check your inbox for a verification link."
        }
        title="Verify your email"
      />

      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          Email/password sign-in stays blocked until verification completes.
          Google sign-in does not require this step.
        </p>
        {statusMessage ? <p>{statusMessage}</p> : null}
        {email ? (
          <Button
            className="w-full"
            disabled={isSending}
            size="lg"
            onClick={() => void handleResend()}
          >
            {isSending ? <Spinner data-icon="inline-start" /> : null}
            {isSending ? "Sending…" : "Resend verification email"}
          </Button>
        ) : null}
      </div>
    </AuthPageBody>
  )
}
