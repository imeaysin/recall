"use client"

import type React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { CommandTrigger } from "../command-palette"
import { useSidebarState } from "../sidebar-state"
import type { NavItem } from "../types"
import { ShellMobileNavItem, ShellNavItem } from "./navigation-item"

export function ShellNav({ items }: { items: NavItem[] }): React.ReactElement {
  const { isIconSidebar } = useSidebarState()

  return (
    <nav
      className={cn(
        "flex w-full flex-col gap-1",
        isIconSidebar ? "items-center" : "items-stretch"
      )}
    >
      {items.map((item) => (
        <ShellNavItem item={item} key={item.name} />
      ))}
      {isIconSidebar ? <CommandTrigger /> : null}
    </nav>
  )
}

export function ShellMobileNav({
  items,
}: {
  items: NavItem[]
}): React.ReactElement {
  return (
    <>
      <nav
        className={cn(
          "fixed bottom-0 left-0 z-30 flex w-full border-t border-border bg-background/80 px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] shadow backdrop-blur-md md:hidden"
        )}
      >
        {items.map((item) => (
          <ShellMobileNavItem item={item} key={item.name} />
        ))}
      </nav>
      <div className="block pt-12 md:hidden" />
    </>
  )
}
