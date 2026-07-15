import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { authClient } from "@workspace/auth/client"
import {
  ForgotPasswordSchema,
  type ForgotPasswordInput,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>
          We will email you a reset link if the account exists.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <p className="text-sm text-muted-foreground">
            Check your inbox for a password reset link.
          </p>
        ) : (
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...form.register("email")}
              />
            </div>
            {formError ? (
              <p className="text-sm text-destructive">{formError}</p>
            ) : null}
            <Button disabled={form.formState.isSubmitting} type="submit">
              Send reset link
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="text-sm">
        <Link className="underline" to={routes.signIn}>
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  )
}
