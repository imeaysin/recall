"use client"

import * as React from "react"
import { ChevronsUpDownIcon, LogOutIcon, type LucideIcon } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui-shadcn/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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

export type NavUserLinkComponent = React.ComponentType<{
  href: string
  className?: string
  children?: React.ReactNode
  [key: string]: unknown
}>

export function NavUser({
  user,
  menuItems,
  onSignOut,
  linkComponent: Link,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
  menuItems?: {
    label: string
    href?: string
    icon?: LucideIcon
    onClick?: () => void
  }[]
  onSignOut?: () => void
  linkComponent?: NavUserLinkComponent
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            {menuItems && menuItems.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {menuItems.map((item, index) => {
                    if (item.href && Link) {
                      return (
                        <DropdownMenuItem key={index} asChild>
                          <Link
                            href={item.href}
                            className="flex w-full items-center"
                          >
                            {item.icon && (
                              <item.icon className="mr-2 h-4 w-4" />
                            )}
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      )
                    }
                    return (
                      <DropdownMenuItem key={index} onClick={item.onClick}>
                        {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                        {item.label}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuGroup>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut}>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
