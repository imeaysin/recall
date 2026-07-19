import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { authClient } from "@workspace/auth/client"
import {
  ResetPasswordSchema,
  type ResetPasswordInput,
} from "@workspace/contracts"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Spinner } from "@workspace/ui/components/spinner"
import { routes } from "@/config/routes"
import { AuthPageBody } from "@/features/auth/components/auth-page-body"
import { AuthPageHeader } from "@/features/auth/components/auth-page-header"

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
      <AuthPageBody
        footer={
          <Link
            className="text-foreground underline underline-offset-2"
            to={routes.forgotPassword}
          >
            Forgot password
          </Link>
        }
      >
        <AuthPageHeader
          description="Request a new password reset email to continue."
          title="Invalid reset link"
        />
      </AuthPageBody>
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

  const errors = form.formState.errors
  const isSubmitting = form.formState.isSubmitting

  return (
    <AuthPageBody>
      <AuthPageHeader
        description="Choose a new password for your account."
        title="Reset password"
      />

      <form
        className="flex flex-col gap-4"
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup>
          <Field data-invalid={errors.password ? true : undefined}>
            <FieldLabel htmlFor="password">New password</FieldLabel>
            <Input
              aria-invalid={Boolean(errors.password)}
              autoComplete="new-password"
              id="password"
              type="password"
              {...form.register("password")}
            />
            <FieldError errors={[errors.password]} />
          </Field>
          <Field data-invalid={errors.confirmPassword ? true : undefined}>
            <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
            <Input
              aria-invalid={Boolean(errors.confirmPassword)}
              autoComplete="new-password"
              id="confirmPassword"
              type="password"
              {...form.register("confirmPassword")}
            />
            <FieldError errors={[errors.confirmPassword]} />
          </Field>
        </FieldGroup>
        {formError ? (
          <p className="text-sm text-destructive">{formError}</p>
        ) : null}
        <Button
          className="w-full"
          disabled={isSubmitting}
          size="lg"
          type="submit"
        >
          {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
          Update password
        </Button>
      </form>
    </AuthPageBody>
  )
}
