"use client"

import {
  useAuthUiConfig,
  useChangeEmail,
  useSession,
} from "@workspace/auth/react"
import { type SyntheticEvent, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardFooter, CardPanel } from "@workspace/ui/components/card"
import { Field, FieldError } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Spinner } from "@workspace/ui/components/spinner"
import { toastManager } from "@workspace/ui/components/toast"
import { cn } from "@workspace/ui/lib/utils"

export interface ChangeEmailProps {
  className?: string
}

export function ChangeEmail({ className }: ChangeEmailProps) {
  const config = useAuthUiConfig()
  const { data: session } = useSession()
  const { mutate: changeEmail, isPending } = useChangeEmail()
  const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({})

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    changeEmail(
      {
        newEmail: formData.get("email") as string,
        callbackURL: config.absoluteAppUrl(config.routes.settingsAccount),
      },
      {
        onSuccess: () => {
          toastManager.add({
            title: "Verification email sent to your new address",
            type: "success",
          })
        },
      }
    )
  }

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold">Change email</h2>

      <form onSubmit={handleSubmit}>
        <Card className={cn(className)}>
          <CardPanel className="flex flex-col gap-6">
            <Field data-invalid={!!fieldErrors.email}>
              <Label htmlFor="email">Email</Label>

              {session ? (
                <Input
                  key={session.user.email}
                  aria-invalid={!!fieldErrors.email}
                  autoComplete="email"
                  defaultValue={session.user.email}
                  disabled={isPending}
                  id="email"
                  name="email"
                  onChange={() => {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  onInvalid={(e) => {
                    e.preventDefault()
                    setFieldErrors((prev) => ({
                      ...prev,
                      email: (e.target as HTMLInputElement).validationMessage,
                    }))
                  }}
                  placeholder="you@example.com"
                  required
                  type="email"
                />
              ) : (
                <Skeleton>
                  <Input className="invisible" />
                </Skeleton>
              )}

              <FieldError>{fieldErrors.email}</FieldError>
            </Field>
          </CardPanel>

          <CardFooter>
            <Button disabled={isPending || !session} size="sm" type="submit">
              {isPending ? <Spinner /> : null}
              Update email
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
