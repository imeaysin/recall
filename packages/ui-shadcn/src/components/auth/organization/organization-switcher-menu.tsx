"use client"

import {
  useActiveOrganization,
  useAuthUiConfig,
  useListOrganizations,
  useAuthSession,
  useSetActiveOrganization,
} from "@workspace/auth/react"
import type { OrganizationSummary } from "@workspace/auth/types/organization"
import { Check, PlusCircle, Settings } from "lucide-react"
import type { ReactNode } from "react"
import {
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@workspace/ui-shadcn/components/dropdown-menu"
import { toast } from "@workspace/ui-shadcn/components/sonner"
import { AuthUserView } from "../auth-user-view"
import { OrganizationLogo } from "./organization-logo"
import { OrganizationView } from "./organization-view"

export type OrganizationSwitcherMenuProps = {
  hideCreate?: boolean
  hideHeader?: boolean
  hidePersonal?: boolean
  onClose: () => void
  onCreateOrganization?: () => void
}

export function OrganizationSwitcherMenu({
  hideCreate = false,
  hideHeader = false,
  hidePersonal = false,
  onClose,
  onCreateOrganization,
}: OrganizationSwitcherMenuProps) {
  const config = useAuthUiConfig()
  const { data: session } = useAuthSession()
  const { data: activeOrganization } = useActiveOrganization()
  const { data: organizations } = useListOrganizations()
  const { mutateAsync: setActiveOrganization, isPending } =
    useSetActiveOrganization()

  const activeOrganizationId = session?.session.activeOrganizationId ?? null
  const activeOrg = activeOrganization
  const orgList = organizations ?? []

  function handleSetActive(organization: OrganizationSummary | null) {
    const organizationId = organization?.id ?? null

    if (organizationId === activeOrganizationId) {
      onClose()
      return
    }

    onClose()

    const promise = setActiveOrganization({ organizationId })
    toast.promise(promise, {
      loading: "Switching workspace…",
      success: organization?.name
        ? `Switched to ${organization.name}`
        : "Workspace switched",
      error: "Could not switch workspace",
    })
  }

  let menuHeader: ReactNode = null
  if (!hideHeader) {
    if (activeOrg) {
      menuHeader = (
        <div className="px-2 py-2">
          <OrganizationView organization={activeOrg} />
        </div>
      )
    } else if (session && !hidePersonal) {
      menuHeader = (
        <div className="px-2 py-2">
          <AuthUserView user={session.user} />
        </div>
      )
    }
  }

  const showPersonalSwitcher = Boolean(activeOrg && !hidePersonal)
  const hasSwitcherEntries = showPersonalSwitcher || orgList.length > 0
  const hasWorkspaceActions = Boolean(activeOrg) || !hideCreate

  return (
    <>
      {menuHeader}
      {menuHeader ? <DropdownMenuSeparator /> : null}

      {hasSwitcherEntries ? (
        <DropdownMenuGroup>
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          {showPersonalSwitcher ? (
            <DropdownMenuItem
              disabled={isPending}
              onClick={() => handleSetActive(null)}
            >
              <AuthUserView hideSubtitle user={session?.user} />
            </DropdownMenuItem>
          ) : null}

          {orgList.map((organization) => {
            const isActive = organization.id === activeOrganizationId

            return (
              <DropdownMenuItem
                key={organization.id}
                disabled={isPending || isActive}
                onClick={() => handleSetActive(organization)}
              >
                <OrganizationLogo organization={organization} size="xs" />
                <span className="min-w-0 flex-1 truncate">
                  {organization.name}
                </span>
                {isActive ? (
                  <Check className="ml-auto size-4 text-muted-foreground" />
                ) : null}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      ) : null}

      {hasWorkspaceActions ? (
        <>
          {hasSwitcherEntries ? (
            <DropdownMenuSeparator className="my-1.5" />
          ) : null}
          <DropdownMenuGroup>
            {activeOrg ? (
              <DropdownMenuItem
                disabled={isPending}
                onClick={() => {
                  onClose()
                  config.navigate(config.routes.organizationSettings)
                }}
              >
                <Settings className="text-muted-foreground" />
                Workspace settings
              </DropdownMenuItem>
            ) : null}

            {!hideCreate ? (
              <DropdownMenuItem
                disabled={isPending}
                onClick={() => {
                  onClose()
                  onCreateOrganization?.()
                }}
              >
                <PlusCircle className="text-muted-foreground" />
                Create workspace
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuGroup>
        </>
      ) : null}
    </>
  )
}
