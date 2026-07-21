import { useSearchParams } from "react-router-dom"
import { defaultAuthenticatedRoute } from "@/config/routes"
import { site } from "@/config/site"
import { AuthPageBody } from "@/features/auth/components/auth-page-body"
import { AuthPageHeader } from "@/features/auth/components/auth-page-header"
import { GithubSignInButton } from "@/features/auth/components/github-sign-in-button"
import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button"
import { getSafeRedirectPath } from "@/routing/safe-redirect"

export function SignInPage() {
  const [searchParams] = useSearchParams()
  const redirectPath = getSafeRedirectPath(
    searchParams.get("redirect"),
    defaultAuthenticatedRoute
  )

  return (
    <AuthPageBody>
      <AuthPageHeader
        description="Continue with Google or GitHub — no password required."
        title={`Welcome to ${site.name}`}
      />

      <div className="flex flex-col gap-3">
        <GoogleSignInButton callbackPath={redirectPath} />
        <GithubSignInButton callbackPath={redirectPath} />
      </div>
    </AuthPageBody>
  )
}
