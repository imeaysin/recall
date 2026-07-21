"use client"

import * as React from "react"
import { AppSidebar as UiAppSidebar } from "@workspace/ui/components/app-sidebar"
import type { ComponentProps } from "react"
import { useAppShellConfig } from "@/features/shell/use-app-shell-config"
import { Link } from "react-router-dom"

const RouterLink = React.forwardRef<
  HTMLAnchorElement,
  Omit<React.ComponentProps<typeof Link>, "to"> & { href?: string; to?: string }
>((props, ref) => {
  const { href, to, ...rest } = props
  return <Link ref={ref} to={to || href || "#"} {...rest} />
})
RouterLink.displayName = "RouterLink"

type AppSidebarProps = Omit<
  ComponentProps<typeof UiAppSidebar>,
  | "user"
  | "teams"
  | "brand"
  | "navMain"
  | "projects"
  | "userMenuItems"
  | "activeTeamId"
  | "onSignOut"
  | "onTeamChange"
  | "onAddTeam"
  | "linkComponent"
>

export function AppSidebar(props: AppSidebarProps) {
  const { navMain, projects, user, teams, brand, onSignOut, userMenuItems } =
    useAppShellConfig()

  return (
    <UiAppSidebar
      brand={brand}
      linkComponent={RouterLink}
      navMain={navMain}
      onSignOut={onSignOut}
      projects={projects}
      teams={teams}
      user={user}
      userMenuItems={userMenuItems}
      {...props}
    />
  )
}
