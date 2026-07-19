import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { signOut } from "@workspace/auth/client"
import { Spinner } from "@workspace/ui/components/spinner"
import { routes } from "@/config/routes"
import { AuthPageBody } from "@/features/auth/components/auth-page-body"
import { AuthPageHeader } from "@/features/auth/components/auth-page-header"

export function SignOutPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      const result = await signOut()
      if (cancelled) return
      if (result.error) {
        setError(result.error.message ?? "Unable to sign out")
        return
      }
      navigate(routes.signIn, { replace: true })
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [navigate])

  return (
    <AuthPageBody
      footer={
        error ? (
          <Link
            className="text-foreground underline underline-offset-2"
            to={routes.signIn}
          >
            Continue to sign in
          </Link>
        ) : null
      }
    >
      <AuthPageHeader title="Signing out" />
      {error ? (
        <p className="text-center text-sm text-destructive">{error}</p>
      ) : (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          <p>Clearing your session…</p>
        </div>
      )}
    </AuthPageBody>
  )
}
