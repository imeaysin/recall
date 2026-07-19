import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { authClient } from "@workspace/auth/client"
import {
  ForgotPasswordSchema,
  type ForgotPasswordInput,
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

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(values: ForgotPasswordInput) {
    setFormError(null)
    const result = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: new URL(routes.resetPassword, window.location.origin).href,
    })

    if (result.error) {
      setFormError(result.error.message ?? "Unable to send reset email")
      return
    }

    setSent(true)
  }

  const emailError = form.formState.errors.email
  const isSubmitting = form.formState.isSubmitting

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
        description="We will email you a reset link if the account exists."
        title="Forgot password"
      />

      {sent ? (
        <p className="text-center text-sm text-muted-foreground">
          Check your inbox for a password reset link.
        </p>
      ) : (
        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Field data-invalid={emailError ? true : undefined}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                aria-invalid={Boolean(emailError)}
                autoComplete="email"
                id="email"
                type="email"
                {...form.register("email")}
              />
              <FieldError errors={[emailError]} />
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
            Send reset link
          </Button>
        </form>
      )}
    </AuthPageBody>
  )
}
