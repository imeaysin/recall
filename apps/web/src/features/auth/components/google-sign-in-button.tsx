import { useState } from "react"
import { signIn } from "@workspace/auth/client"
import { Button } from "@workspace/ui-shadcn/components/button"
import { buildAuthCallback } from "@/features/auth/lib/auth-callback"

type GoogleSignInButtonProps = {
  readonly callbackPath: string
  readonly label?: string
}

export function GoogleSignInButton({
  callbackPath,
  label = "Continue with Google",
}: GoogleSignInButtonProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function continueWithGoogle() {
    setErrorMessage(null)
    setIsLoading(true)
    const result = await signIn.social({
      provider: "google",
      callbackURL: buildAuthCallback(callbackPath),
    })
    setIsLoading(false)

    if (result.error) {
      setErrorMessage(
        result.error.message ??
          "Google sign-in is unavailable. Check OAuth credentials in .env."
      )
    }
  }

  return (
    <div className="grid gap-2">
      <Button
        disabled={isLoading}
        type="button"
        variant="outline"
        onClick={() => void continueWithGoogle()}
      >
        {isLoading ? "Redirecting…" : label}
      </Button>
      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  )
}
