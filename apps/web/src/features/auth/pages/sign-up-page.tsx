import { zodResolver } from "@hookform/resolvers/zod"
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom"
import { Controller, useForm, useFormState } from "react-hook-form"
import { signUpSchema, type SignUpInput } from "@workspace/contracts"
import { AuthDivider, AuthPageBody, AuthPageHeader } from "@workspace/ui/auth"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Form } from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"
import { PasswordInput } from "@workspace/ui/components/password-input"
import { PageLoading } from "@workspace/ui/components/page-loading"
import { toastManager } from "@workspace/ui/components/toast"
import { AuthButtons } from "@/features/auth/components/auth-buttons"
import { useAuthSession, useSignUpEmail } from "@workspace/auth/react"
import {
  absoluteAppUrl,
  defaultAuthenticatedRoute,
  routes,
} from "@/config/routes"
import { site } from "@/config/site"
import {
  getSafeRedirectPath,
  withAuthRedirectQuery,
} from "@/routing/safe-redirect"

export function SignUpPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectPath = getSafeRedirectPath(
    searchParams.get("redirect"),
    defaultAuthenticatedRoute
  )
  const { data: session, isPending } = useAuthSession()
  const signUp = useSignUpEmail()
  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })
  const { errors } = useFormState({ control: form.control })

  if (isPending) {
    return <PageLoading />
  }

  if (session) {
    return <Navigate replace to={redirectPath} />
  }

  async function onSubmit(values: SignUpInput) {
    try {
      await signUp.mutateAsync({
        ...values,
        callbackURL: absoluteAppUrl(routes.verifyEmail),
      })
      toastManager.add({
        title: "Account created",
        description: "Check your email to verify your account.",
        type: "success",
      })
      navigate(
        `${routes.verifyEmail}?email=${encodeURIComponent(values.email)}`
      )
    } catch {
      form.setError("email", {
        message: "Could not create your account. Please try again.",
      })
    }
  }

  const formErrors: Record<string, string> = {}
  if (errors.name?.message) formErrors.name = errors.name.message
  if (errors.email?.message) formErrors.email = errors.email.message
  if (errors.password?.message) formErrors.password = errors.password.message
  if (errors.confirmPassword?.message) {
    formErrors.confirmPassword = errors.confirmPassword.message
  }

  return (
    <AuthPageBody
      footer={
        <p className="font-sans text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            className="text-foreground underline underline-offset-2 transition-colors hover:text-foreground/80"
            to={withAuthRedirectQuery(routes.signIn, {
              redirect: searchParams.get("redirect"),
              fallback: defaultAuthenticatedRoute,
            })}
          >
            Sign in
          </Link>
        </p>
      }
    >
      <AuthPageHeader
        description="Create your account to get started"
        title={`Join ${site.name}`}
      />

      <AuthButtons callbackPath={redirectPath} />

      <AuthDivider />

      <Form
        className="flex flex-col gap-4"
        errors={Object.keys(formErrors).length > 0 ? formErrors : undefined}
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Controller
          control={form.control}
          name="name"
          render={({ field }) => (
            <Field name="name">
              <FieldLabel htmlFor="sign-up-name">Name</FieldLabel>
              <Input
                {...field}
                autoComplete="name"
                id="sign-up-name"
                placeholder="Your name"
                type="text"
              />
              <FieldError />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="email"
          render={({ field }) => (
            <Field name="email">
              <FieldLabel htmlFor="sign-up-email">Email</FieldLabel>
              <Input
                {...field}
                autoComplete="email"
                id="sign-up-email"
                placeholder="you@example.com"
                type="email"
              />
              <FieldError />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field }) => (
            <Field name="password">
              <FieldLabel htmlFor="sign-up-password">Password</FieldLabel>
              <FieldControl
                {...field}
                render={(controlProps) => (
                  <PasswordInput
                    {...controlProps}
                    autoComplete="new-password"
                    id="sign-up-password"
                    placeholder="Create a password"
                  />
                )}
              />
              <FieldError />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <Field name="confirmPassword">
              <FieldLabel htmlFor="sign-up-confirm-password">
                Confirm password
              </FieldLabel>
              <FieldControl
                {...field}
                render={(controlProps) => (
                  <PasswordInput
                    {...controlProps}
                    autoComplete="new-password"
                    id="sign-up-confirm-password"
                    placeholder="Confirm your password"
                  />
                )}
              />
              <FieldError />
            </Field>
          )}
        />
        <Button
          className="w-full"
          loading={signUp.isPending}
          size="lg"
          type="submit"
          variant="default"
        >
          Create account
        </Button>
      </Form>
    </AuthPageBody>
  )
}
