import {
  checkOrganizationSlugAvailable,
  resolveAvailableOrganizationSlug,
  useCreateOrganization,
  useAuthSession,
} from "@workspace/auth/react"
import { useNavigate } from "react-router-dom"
import { toast } from "@workspace/ui-shadcn/components/sonner"
import { routes } from "@/config/routes"

export function useWorkspaceOnboarding() {
  const navigate = useNavigate()
  const { data: session } = useAuthSession()
  const { mutateAsync: createOrganization, isPending } = useCreateOrganization()

  const onSubmit = async (values: { name: string }) => {
    const userId = session?.user.id
    if (!userId) return

    const slug = await resolveAvailableOrganizationSlug(
      values.name,
      userId,
      checkOrganizationSlugAvailable
    )

    const createOrgPromise = createOrganization({ name: values.name, slug })

    toast.promise(createOrgPromise, {
      loading: "Creating workspace…",
      success: "Workspace created",
      error: "Could not create workspace",
    })

    try {
      await createOrgPromise
      navigate(routes.dashboard, { replace: true })
    } catch {
      // Error is handled by toast
    }
  }

  return {
    props: {
      isPending,
      onSubmit,
    },
  }
}
