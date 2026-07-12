import { useUpdateUser } from "@workspace/auth/react"
import type { UserProfileProps } from "@workspace/ui-shadcn/auth"
import { toast } from "@workspace/ui-shadcn/components/sonner"

export function useUserProfileForm(): UserProfileProps {
  const { mutateAsync: updateUser, isPending } = useUpdateUser()

  return {
    isPending,
    onSubmit: (values) => {
      const promise = updateUser(values)
      toast.promise(promise, {
        loading: "Saving profile…",
        success: "Profile updated",
        error: "Could not update profile",
      })
    },
  }
}
