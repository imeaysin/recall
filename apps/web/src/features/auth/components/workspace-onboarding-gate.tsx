"use client"

import {
  useListOrganizations,
  useAuthSession,
  useSignOut,
} from "@workspace/auth/react"
import { WorkspaceOnboarding } from "@workspace/ui/auth"
import { PageLoading } from "@workspace/ui/components/page-loading"
import type { ReactNode } from "react"
import { Link as RouterLink } from "react-router-dom"
import { useWorkspaceOnboarding } from "@/features/auth/hooks/use-workspace-onboarding"
import { routes } from "@/config/routes"

export function WorkspaceOnboardingGate({ children }: { children: ReactNode }) {
  const { data: session, isPending: sessionPending } = useAuthSession()
  const { data: organizations, isPending: organizationsPending } =
    useListOrganizations()
  const signOut = useSignOut()
  const onboarding = useWorkspaceOnboarding()

  if (sessionPending || organizationsPending) {
    return <PageLoading />
  }

  if (session && organizations && organizations.length === 0) {
    return (
      <WorkspaceOnboarding
        {...onboarding.props}
        homeHref={routes.home}
        linkComponent={({ href, className, children: linkChildren }) => (
          <RouterLink className={className} to={href}>
            {linkChildren}
          </RouterLink>
        )}
        onSignOut={() => signOut.mutate()}
      />
    )
  }

  return children
}
