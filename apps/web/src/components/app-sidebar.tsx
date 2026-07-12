"use client"

import * as React from "react"
import { NavMain } from "@workspace/ui-shadcn/components/shell/nav-main"
import { NavProjects } from "@workspace/ui-shadcn/components/shell/nav-projects"
import { NavUser } from "@workspace/ui-shadcn/components/shell/nav-user"
import { TeamSwitcher } from "@workspace/ui-shadcn/components/shell/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui-shadcn/components/sidebar"
import { useAppShellConfig } from "@/features/shell/use-app-shell-config"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { navMain, projects, user, teams } = useAppShellConfig()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
