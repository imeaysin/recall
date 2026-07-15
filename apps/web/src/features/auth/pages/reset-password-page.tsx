import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { authClient } from "@workspace/auth/client"
import {
  ResetPasswordSchema,
  type ResetPasswordInput,
} from "@workspace/contracts"
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
import { routes } from "@/config/routes"

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invalid reset link</CardTitle>
          <CardDescription>
            Request a new password reset email to continue.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link className="text-sm underline" to={routes.forgotPassword}>
            Forgot password
          </Link>
        </CardFooter>
      </Card>
    )
  }

  const resetToken = token

  async function onSubmit(values: ResetPasswordInput) {
    setFormError(null)
    const result = await authClient.resetPassword({
      newPassword: values.password,
      token: resetToken,
    })

    if (result.error) {
      setFormError(result.error.message ?? "Unable to reset password")
      return
    }

    navigate(routes.signIn, { replace: true })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>
          Choose a new password for your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="password">New password</Label>
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
            Update password
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
