import { useAuthUiConfig, useChangeEmail } from "@workspace/auth/react"
import type { ChangeEmailProps } from "@workspace/ui-shadcn/auth"
import { toast } from "@workspace/ui-shadcn/components/sonner"

export function useChangeEmailForm(): ChangeEmailProps {
  const config = useAuthUiConfig()
  const { mutate: changeEmail, isPending } = useChangeEmail()

  return {
    isPending,
    onSubmit: (values) => {
      const promise = new Promise<void>((resolve, reject) =>
        changeEmail(
          {
            newEmail: values.email,
            callbackURL: config.absoluteAppUrl(config.routes.settingsAccount),
          },
          { onSuccess: () => resolve(), onError: reject }
        )
      )
      toast.promise(promise, {
        loading: "Sending verification email…",
        success: "Verification email sent",
        error: "Could not send verification email",
      })
    },
  }
}
