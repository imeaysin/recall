"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { NavMain } from "@workspace/ui-shadcn/components/nav-main"
import { NavUser } from "@workspace/ui-shadcn/components/nav-user"
import { TeamSwitcher } from "@workspace/ui-shadcn/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui-shadcn/components/sidebar"
import { useAuthSession } from "@workspace/auth/react"

export function AppSidebar({
  navigation,
  onCreateOrganization,
  onSignOut,
  userMenuItems,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  navigation: {
    name: string
    href: string
    icon: LucideIcon
    badge?: string
    isCurrent?: (params: { pathname: string }) => boolean
  }[]
  onCreateOrganization?: () => void
  onSignOut?: () => void
  userMenuItems?: { label: string; href?: string; icon?: LucideIcon }[]
}) {
  const { data: session } = useAuthSession()

  // Transform app navigation into NavMain format
  const navMainItems = navigation.map((item) => ({
    title: item.name,
    url: item.href,
    icon: item.icon,
    isActive: item.isCurrent?.({
      pathname: typeof window !== "undefined" ? window.location.pathname : "",
    }),
  }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher onCreateOrganization={onCreateOrganization} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
      </SidebarContent>
      <SidebarFooter>
        {session?.user ? (
          <NavUser
            user={{
              name: session.user.name ?? "User",
              email: session.user.email ?? "",
              avatar: session.user.image ?? "",
            }}
            menuItems={userMenuItems}
            onSignOut={onSignOut}
          />
        ) : null}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
