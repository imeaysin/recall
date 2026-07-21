"use client"

import * as React from "react"
import { CommandIcon } from "lucide-react"
import { NavUser } from "@workspace/ui/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"

export type AppSidebarNavItem = {
  title: string
  url: string
  icon?: React.ReactNode
  isActive?: boolean
  items?: {
    title: string
    url: string
    isActive?: boolean
  }[]
}

export type AppSidebarProject = {
  name: string
  url: string
  icon: React.ReactNode
  isActive?: boolean
}

export type AppSidebarTeam = {
  id: string
  name: string
  logo: React.ReactNode
  plan: string
}

export type AppSidebarUser = {
  name: string
  email: string
  avatar: string
}

export type AppSidebarUserMenuItem = {
  label: string
  href?: string
  icon?: React.ReactNode
  onClick?: () => void
}

export type AppSidebarBrand = {
  name: string
  plan?: string
  logo?: React.ReactNode
}

export type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: AppSidebarUser
  teams?: AppSidebarTeam[]
  brand?: AppSidebarBrand
  navMain: AppSidebarNavItem[]
  projects?: AppSidebarProject[]
  userMenuItems?: AppSidebarUserMenuItem[]
  activeTeamId?: string | null
  onSignOut?: () => void
  onTeamChange?: (team: AppSidebarTeam) => void
  onAddTeam?: () => void
  linkComponent?: React.ElementType
  navLabel?: string
  projectsLabel?: string
  searchPlaceholder?: string
}

export function AppSidebar({
  user,
  teams = [],
  brand,
  navMain,
  userMenuItems,
  onSignOut,
  linkComponent: LinkComponent = "a",
  searchPlaceholder = "Type to search...",
  ...props
}: AppSidebarProps) {
  const { setOpen } = useSidebar()
  const [query, setQuery] = React.useState("")

  const activeTeam = teams[0]
  const brandName = brand?.name ?? activeTeam?.name ?? "App"
  const brandPlan = brand?.plan ?? activeTeam?.plan ?? ""
  const brandLogo = brand?.logo ?? activeTeam?.logo ?? <CommandIcon />

  const activeItem = navMain.find((item) => item.isActive) ?? navMain[0] ?? null

  const secondaryItems = React.useMemo(() => {
    const items = activeItem?.items ?? []
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return items
    return items.filter((item) => item.title.toLowerCase().includes(trimmed))
  }, [activeItem, query])

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="md:h-8 md:p-0"
                render={<LinkComponent href={navMain[0]?.url ?? "/"} />}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  {brandLogo}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{brandName}</span>
                  {brandPlan ? (
                    <span className="truncate text-xs">{brandPlan}</span>
                  ) : null}
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      isActive={activeItem?.title === item.title}
                      className="px-2.5 md:px-2"
                      render={<LinkComponent href={item.url} />}
                      onClick={() => {
                        setQuery("")
                        setOpen(true)
                      }}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser
            linkComponent={LinkComponent}
            menuItems={userMenuItems}
            onSignOut={onSignOut}
            user={user}
          />
        </SidebarFooter>
      </Sidebar>

      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-base font-medium text-foreground">
              {activeItem?.title}
            </div>
          </div>
          <SidebarInput
            placeholder={searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {secondaryItems.map((item) => (
                <LinkComponent
                  key={item.url}
                  href={item.url}
                  className={cn(
                    "flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    item.isActive &&
                      "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <span className="font-medium">{item.title}</span>
                </LinkComponent>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}
