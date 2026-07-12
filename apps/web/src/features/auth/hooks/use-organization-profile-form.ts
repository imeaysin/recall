import { useUpdateOrganization } from "@workspace/auth/react"
import type { Organization } from "@workspace/auth/types/organization"
import type { OrganizationProfileProps } from "@workspace/ui-shadcn/auth"
import { toast } from "@workspace/ui-shadcn/components/sonner"

export function useOrganizationProfileForm(
  _organization: Organization
): OrganizationProfileProps {
  const { mutateAsync: updateOrganization } = useUpdateOrganization()

  return {
    onSubmit: async (values) => {
      const promise = updateOrganization(values)
      toast.promise(promise, {
        loading: "Saving workspace…",
        success: "Workspace updated",
        error: "Could not update workspace",
      })
      try {
        await promise
      } catch {
        // handled by toast
      }
    },
  }
}
