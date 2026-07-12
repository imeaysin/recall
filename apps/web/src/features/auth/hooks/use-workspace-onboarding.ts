import {
  checkOrganizationSlugAvailable,
  resolveAvailableOrganizationSlug,
  useCreateOrganization,
  useAuthSession,
} from "@workspace/auth/react"
import { useNavigate } from "react-router-dom"
import { toastManager } from "@workspace/ui-shadcn/components/toast"
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

    toastManager.promise(createOrgPromise, {
      error: {
        description: "Please try again or choose a different name.",
        title: "Could not create workspace",
        type: "error",
      },
      loading: {
        title: "Creating workspace…",
        description: "The workspace is being created.",
        type: "loading",
      },
      success: {
        description: "You're ready to use Theo.",
        title: "Workspace created",
        type: "success",
      },
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
