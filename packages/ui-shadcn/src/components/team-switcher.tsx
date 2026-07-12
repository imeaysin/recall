"use client"

import * as React from "react"
import { ChevronsUpDownIcon, PlusIcon, Building2Icon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui-shadcn/components/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui-shadcn/components/sidebar"
import {
  useActiveOrganization,
  useListOrganizations,
  useSetActiveOrganization,
} from "@workspace/auth/react"
import { toastManager } from "@workspace/ui-shadcn/components/toast"
import { OrganizationLogo } from "@workspace/ui-shadcn/components/auth/organization/organization-logo"

export function TeamSwitcher({
  onCreateOrganization,
}: {
  onCreateOrganization?: () => void
}) {
  const { isMobile } = useSidebar()
  const { data: activeOrganization } = useActiveOrganization()
  const { data: organizations } = useListOrganizations()
  const { mutateAsync: setActiveOrganization, isPending } =
    useSetActiveOrganization()

  const orgList = organizations ?? []

  function handleSetActive(organizationId: string) {
    if (organizationId === activeOrganization?.id) return

    void toastManager
      .promise(setActiveOrganization({ organizationId }), {
        error: {
          description: "Please try again.",
          title: "Could not switch workspace",
          type: "error",
        },
        loading: {
          title: "Switching workspace…",
          description: "The workspace is being switched.",
          type: "loading",
        },
        success: {
          title: "Workspace switched",
          type: "success",
        },
      })
      .catch(() => undefined)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {activeOrganization ? (
                  <OrganizationLogo
                    organization={activeOrganization}
                    size="xs"
                  />
                ) : (
                  <Building2Icon className="size-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeOrganization?.name ?? "Personal Workspace"}
                </span>
                <span className="truncate text-xs">
                  {activeOrganization?.slug ?? "Free"}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Workspaces
            </DropdownMenuLabel>
            {orgList.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleSetActive(org.id)}
                className="gap-2 p-2"
                disabled={isPending || org.id === activeOrganization?.id}
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <OrganizationLogo organization={org} size="xs" />
                </div>
                {org.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => onCreateOrganization?.()}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <PlusIcon className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Create workspace
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
