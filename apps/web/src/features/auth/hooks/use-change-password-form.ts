import { useChangePassword } from "@workspace/auth/react"
import type { ChangePasswordFormProps } from "@workspace/ui-shadcn/auth"
import { toast } from "@workspace/ui-shadcn/components/sonner"

export function useChangePasswordForm(): ChangePasswordFormProps {
  const { mutate: changePassword, isPending } = useChangePassword()

  return {
    isPending,
    onSubmit: (values) => {
      changePassword(
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          revokeOtherSessions: true,
        },
        {
          onError: () => {
            toast.error("Update failed", {
              description: "Check your current password and try again.",
            })
          },
          onSuccess: () => {
            toast.success("Password updated", {
              description: "Your password has been updated.",
            })
          },
        }
      )
    },
  }
}
