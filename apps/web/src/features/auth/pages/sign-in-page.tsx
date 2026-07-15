import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "@workspace/auth/client"
import { SignInSchema, type SignInInput } from "@workspace/contracts"
import { Button } from "@workspace/ui-shadcn/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui-shadcn/components/card"
import { Input } from "@workspace/ui-shadcn/components/input"
import { Label } from "@workspace/ui-shadcn/components/label"
import { routes, defaultAuthenticatedRoute } from "@/config/routes"
import { getSafeRedirectPath } from "@/routing/safe-redirect"
import { AuthDivider } from "@/features/auth/components/auth-divider"
import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button"
import { buildAuthCallback } from "@/features/auth/lib/auth-callback"
import { resolveSignInFeedback } from "@/features/auth/lib/sign-in-feedback"

export function SignInPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formError, setFormError] = useState<string | null>(null)
  const [verifyEmailHref, setVerifyEmailHref] = useState<string | null>(null)
  const form = useForm<SignInInput>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: "", password: "" },
  })

  const redirectPath = getSafeRedirectPath(
    searchParams.get("redirect"),
    defaultAuthenticatedRoute
  )

  async function onSubmit(values: SignInInput) {
    setFormError(null)
    setVerifyEmailHref(null)
    const result = await signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: buildAuthCallback(redirectPath),
    })

    if (result.error) {
      const feedback = resolveSignInFeedback(
        {
          code: result.error.code,
          message: result.error.message,
        },
        values.email
      )
      setFormError(feedback.message)
      setVerifyEmailHref(feedback.verifyEmailHref ?? null)
      return
    }

    navigate(redirectPath, { replace: true })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Use Google or your email and password. Email accounts must be verified
          before the first sign-in.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <GoogleSignInButton callbackPath={redirectPath} />
        <AuthDivider />
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...form.register("password")}
            />
            {form.formState.errors.password ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            ) : null}
          </div>
          {formError ? (
            <p className="text-sm text-destructive">{formError}</p>
          ) : null}
          {verifyEmailHref ? (
            <Link className="text-sm underline" to={verifyEmailHref}>
              Resend or open verification instructions
            </Link>
          ) : null}
          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 text-sm">
        <Link className="underline" to={routes.forgotPassword}>
          Forgot password?
        </Link>
        <p>
          No account?{" "}
          <Link className="underline" to={routes.signUp}>
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
