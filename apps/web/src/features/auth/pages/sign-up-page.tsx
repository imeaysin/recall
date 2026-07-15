import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signUp } from "@workspace/auth/client"
import { SignUpSchema, type SignUpInput } from "@workspace/contracts"
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
import { AuthDivider } from "@/features/auth/components/auth-divider"
import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button"
import { buildAuthCallback } from "@/features/auth/lib/auth-callback"

export function SignUpPage() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<SignUpInput>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: SignUpInput) {
    setFormError(null)
    const result = await signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      callbackURL: buildAuthCallback(routes.verifyEmail),
    })

    if (result.error) {
      setFormError(result.error.message ?? "Unable to create account")
      return
    }

    navigate(
      `${routes.verifyEmail}?email=${encodeURIComponent(values.email)}`,
      { replace: true }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>
          Sign up with Google or email. Email sign-ups require verification
          before you can sign in.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <GoogleSignInButton
          callbackPath={defaultAuthenticatedRoute}
          label="Continue with Google"
        />
        <AuthDivider />
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" autoComplete="name" {...form.register("name")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...form.register("email")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...form.register("password")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...form.register("confirmPassword")}
            />
          </div>
          {formError ? (
            <p className="text-sm text-destructive">{formError}</p>
          ) : null}
          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? "Creating…" : "Sign up"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-sm">
        Already have an account?{" "}
        <Link className="ml-1 underline" to={routes.signIn}>
          Sign in
        </Link>
      </CardFooter>
    </Card>
  )
}
