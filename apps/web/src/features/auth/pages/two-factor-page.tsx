import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Controller, useForm, useFormState } from "react-hook-form"
import { TwoFactorSchema, type TwoFactorInput } from "@workspace/contracts"
import { AuthOtpInput, AuthPageBody, AuthPageHeader } from "@workspace/ui/auth"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Form } from "@workspace/ui/components/form"
import { useVerifyTotp } from "@workspace/auth/react"
import { routes, defaultAuthenticatedRoute } from "@/config/routes"
import {
  getSafeRedirectPath,
  withAuthRedirectQuery,
} from "@/routing/safe-redirect"

export function TwoFactorPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectPath = getSafeRedirectPath(
    searchParams.get("redirect"),
    defaultAuthenticatedRoute
  )
  const verifyTotp = useVerifyTotp()

  const form = useForm<TwoFactorInput>({
    resolver: zodResolver(TwoFactorSchema),
    defaultValues: { code: "" },
  })
  const { errors } = useFormState({ control: form.control })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await verifyTotp.mutateAsync(values)
      navigate(redirectPath)
    } catch {
      form.setError("code", {
        message: "Check your authenticator app and try again.",
      })
      form.setValue("code", "")
    }
  })

  const formErrors: Record<string, string> = {}
  if (errors.code?.message) formErrors.code = errors.code.message

  return (
    <AuthPageBody
      footer={
        <Link
          className="font-sans text-sm text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
          to={withAuthRedirectQuery(routes.signIn, {
            redirect: searchParams.get("redirect"),
            fallback: defaultAuthenticatedRoute,
          })}
        >
          Back to sign in
        </Link>
      }
    >
      <AuthPageHeader
        description="Please enter the code from your authenticator app."
        title="Verify your identity"
      />

      <Form
        errors={Object.keys(formErrors).length > 0 ? formErrors : undefined}
        onSubmit={onSubmit}
      >
        <Controller
          control={form.control}
          name="code"
          render={({ field }) => (
            <Field name="code">
              <FieldLabel htmlFor="two-factor-code">
                Verification code
              </FieldLabel>
              <AuthOtpInput
                id="two-factor-code"
                invalid={Boolean(errors.code)}
                onComplete={(value) => {
                  form.setValue("code", value, { shouldValidate: true })
                  void onSubmit()
                }}
                onValueChange={field.onChange}
                value={field.value}
                verifying={verifyTotp.isPending}
              />
              <FieldDescription>
                Open your authenticator app (1Password, Authy, etc.) to get a
                6-digit code.
              </FieldDescription>
              <FieldError />
            </Field>
          )}
        />
      </Form>
    </AuthPageBody>
  )
}
