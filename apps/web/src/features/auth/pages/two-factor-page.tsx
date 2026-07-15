import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { authClient } from "@workspace/auth/client"
import { TwoFactorSchema, type TwoFactorInput } from "@workspace/contracts"
import { Button } from "@workspace/ui-shadcn/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui-shadcn/components/card"
import { Input } from "@workspace/ui-shadcn/components/input"
import { Label } from "@workspace/ui-shadcn/components/label"
import { defaultAuthenticatedRoute } from "@/config/routes"

export function TwoFactorPage() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<TwoFactorInput>({
    resolver: zodResolver(TwoFactorSchema),
    defaultValues: { code: "" },
  })

  async function onSubmit(values: TwoFactorInput) {
    setFormError(null)
    const result = await authClient.twoFactor.verifyTotp({
      code: values.code,
    })

    if (result.error) {
      setFormError(result.error.message ?? "Invalid code")
      return
    }

    navigate(defaultAuthenticatedRoute, { replace: true })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-factor authentication</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="code">Authentication code</Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              {...form.register("code")}
            />
          </div>
          {formError ? (
            <p className="text-sm text-destructive">{formError}</p>
          ) : null}
          <Button disabled={form.formState.isSubmitting} type="submit">
            Verify
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
