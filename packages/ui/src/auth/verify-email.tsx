"use client"

import {
  useAuthUiConfig,
  useSendVerificationEmail,
} from "@workspace/auth/react"
import { useEffect, useState, useSyncExternalStore } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@workspace/ui/components/card"
import { FieldDescription } from "@workspace/ui/components/field"
import { Spinner } from "@workspace/ui/components/spinner"
import { toastManager } from "@workspace/ui/components/toast"
import { cn } from "@workspace/ui/lib/utils"
import { OpenEmailButton } from "./open-email-button"

export interface VerifyEmailProps {
  className?: string
}

const RESEND_COOLDOWN_SECONDS = 60

function subscribeToStorage() {
  return function unsubscribe() {
    /* sessionStorage has no subscribe API */
  }
}

function useStoredVerifyEmail(storageKey: string) {
  return useSyncExternalStore(
    subscribeToStorage,
    () => sessionStorage.getItem(storageKey) ?? "",
    () => ""
  )
}

export function VerifyEmail({ className }: VerifyEmailProps) {
  const config = useAuthUiConfig()
  const email = useStoredVerifyEmail(config.verifyEmailStorageKey)
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS)

  useEffect(() => {
    if (cooldown <= 0 || !email) return
    const interval = setInterval(() => {
      setCooldown((current) => (current > 0 ? current - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [cooldown, email])

  const { mutate: sendVerificationEmail, isPending } =
    useSendVerificationEmail()

  const isCoolingDown = cooldown > 0
  const { Link } = config

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Verify your email
        </CardTitle>
      </CardHeader>

      <CardPanel>
        <div className="flex flex-col gap-4">
          <FieldDescription>
            We sent a verification link to your email address.
          </FieldDescription>

          {email ? (
            <div className="flex flex-col gap-3">
              <OpenEmailButton email={email} />

              <Button
                disabled={isCoolingDown || isPending}
                onClick={() =>
                  sendVerificationEmail(
                    {
                      email,
                      callbackURL: config.absoluteAppUrl(
                        config.routes.defaultAuthenticated
                      ),
                    },
                    {
                      onSuccess: () => {
                        toastManager.add({
                          title: "Verification email sent",
                          type: "success",
                        })
                        setCooldown(RESEND_COOLDOWN_SECONDS)
                      },
                    }
                  )
                }
                type="button"
                variant="outline"
              >
                {isPending ? <Spinner /> : null}
                {isCoolingDown
                  ? `Resend in ${String(cooldown)}s`
                  : "Resend verification email"}
              </Button>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex w-full flex-col items-center gap-3">
          <FieldDescription className="text-center">
            Already verified?{" "}
            <Link
              className="underline underline-offset-4"
              to={config.routes.signIn}
            >
              Sign in
            </Link>
          </FieldDescription>
        </div>
      </CardPanel>
    </Card>
  )
}
