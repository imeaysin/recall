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

export type AppSidebarLinkComponent = React.ComponentType<{
  href: string
  className?: string
  children?: React.ReactNode
  [key: string]: unknown
}>

export function AppSidebar({
  navigation,
  onCreateOrganization,
  onSignOut,
  userMenuItems,
  linkComponent,
  pathname,
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
  linkComponent?: AppSidebarLinkComponent
  /** Pass the current pathname so active state is reactive */
  pathname?: string
}) {
  const { data: session } = useAuthSession()
  const currentPathname =
    pathname ?? (typeof window !== "undefined" ? window.location.pathname : "")

  const navMainItems = navigation.map((item) => ({
    title: item.name,
    url: item.href,
    icon: item.icon,
    badge: item.badge,
    isActive: item.isCurrent?.({ pathname: currentPathname }),
  }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher onCreateOrganization={onCreateOrganization} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} linkComponent={linkComponent} />
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
