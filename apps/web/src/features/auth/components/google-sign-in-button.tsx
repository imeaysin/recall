import { useState, type SVGProps } from "react"
import { signIn } from "@workspace/auth/client"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { buildAuthCallback } from "@/features/auth/lib/auth-callback"

type GoogleSignInButtonProps = {
  readonly callbackPath: string
  readonly label?: string
}

function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#google-icon-a)">
        <path
          d="M10 3.958c1.475 0 2.796.509 3.838 1.5l2.854-2.854C14.959.992 12.696 0 10 0a9.995 9.995 0 0 0-8.933 5.508l3.325 2.58c.787-2.371 3-4.13 5.608-4.13Z"
          fill="#EA4335"
        />
        <path
          d="M19.575 10.23c0-.655-.063-1.288-.158-1.897H10v3.759h5.392a4.648 4.648 0 0 1-1.992 2.991l3.22 2.5c1.88-1.741 2.955-4.316 2.955-7.354Z"
          fill="#4285F4"
        />
        <path
          d="M4.388 11.912A6.075 6.075 0 0 1 4.07 10c0-.667.112-1.308.317-1.913L1.063 5.508A9.964 9.964 0 0 0 0 10c0 1.617.383 3.142 1.067 4.492l3.32-2.58Z"
          fill="#FBBC05"
        />
        <path
          d="M10 20c2.7 0 4.97-.887 6.62-2.42l-3.22-2.5c-.896.603-2.05.958-3.4.958-2.608 0-4.82-1.759-5.612-4.13l-3.325 2.58C2.712 17.758 6.091 20 10 20Z"
          fill="#34A853"
        />
      </g>
      <defs>
        <clipPath id="google-icon-a">
          <path d="M0 0h20v20H0z" fill="currentColor" />
        </clipPath>
      </defs>
    </svg>
  )
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
    <div className="flex flex-col gap-2">
      <Button
        className="w-full"
        disabled={isLoading}
        onClick={() => void continueWithGoogle()}
        size="lg"
        type="button"
        variant="outline"
      >
        {isLoading ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <GoogleIcon className="size-4" />
        )}
        {isLoading ? "Redirecting…" : label}
      </Button>
      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  )
}
