"use client"

import type React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { Navigation } from "./navigation/navigation"
import { NavigationItem } from "./navigation/navigation-item"
import { ShellSidebarBrand } from "./shell-sidebar-brand"
import { useShellSidebar } from "./shell-sidebar-context"
import { ShellSidebarTrigger } from "./shell-sidebar-trigger"
import { CommandTrigger } from "./command-palette"
import { useShell } from "./shell-context"
import type { NavigationItemType } from "./types"

export interface SideBarProps {
  navigation: NavigationItemType[]
  bottomNavItems?: NavigationItemType[]
  logo?: React.ReactNode
  brandLabel?: string
  homeHref?: string
  bannersHeight?: number
}

function SidebarLogoMark({ logo }: { logo: React.ReactNode }): React.ReactElement {
  return (
    <span className="flex size-4 shrink-0 items-center justify-center [&>svg]:size-full">
      {logo}
    </span>
  )
}

export function SideBar({
  navigation,
  bottomNavItems = [],
  logo,
  brandLabel,
  homeHref = "/",
  bannersHeight = 0,
}: SideBarProps): React.ReactElement {
  const { Link } = useShell()
  const { isIconSidebar } = useShellSidebar()

  return (
    <div className="relative">
      <aside
        className={cn(
          "fixed left-0 hidden h-full max-h-screen flex-col overflow-x-hidden overflow-y-auto bg-sidebar p-2 font-sans text-sidebar-foreground transition-[width,min-width] duration-200 ease-linear md:sticky md:flex",
          isIconSidebar
            ? "w-(--sidebar-width-icon) min-w-(--sidebar-width-icon)"
            : "w-(--sidebar-width) min-w-(--sidebar-width)"
        )}
        data-collapsed={isIconSidebar ? "" : undefined}
        style={
          {
            "--sidebar-width": "18rem",
            "--sidebar-width-icon": "3rem",
            maxHeight: `calc(100vh - ${bannersHeight}px)`,
            top: `${bannersHeight}px`,
          } as React.CSSProperties
        }
      >
        <div className="flex h-full flex-col gap-1">
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col gap-1",
              isIconSidebar ? "items-center" : "items-stretch"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-full shrink-0 items-center",
                isIconSidebar ? "justify-center" : "justify-between gap-2"
              )}
            >
              {isIconSidebar ? (
                <ShellSidebarBrand homeHref={homeHref} logo={logo} />
              ) : (
                <>
                  <Link
                    className="flex h-8 min-w-0 items-center gap-2 rounded-lg px-1.5 font-heading text-sm tracking-wide text-sidebar-foreground outline-none transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    href={homeHref}
                  >
                    {logo ? <SidebarLogoMark logo={logo} /> : null}
                    {brandLabel ? (
                      <span className="truncate">{brandLabel}</span>
                    ) : null}
                  </Link>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <CommandTrigger />
                    <ShellSidebarTrigger />
                  </div>
                </>
              )}
            </div>

            <Navigation items={navigation} />
          </div>

          {bottomNavItems.length > 0 ? (
            <div
              className={cn(
                "mt-auto flex flex-col gap-1",
                isIconSidebar ? "items-center" : "items-stretch"
              )}
            >
              {bottomNavItems.map((item) => (
                <NavigationItem item={item} key={item.name} />
              ))}
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  )
}
