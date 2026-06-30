"use client"

import { PanelLeftIcon } from "lucide-react"
import type React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { SidebarLogoMark } from "./navigation/sidebar-logo-mark"
import { sidebarIconButtonClassName } from "./navigation/navigation-styles"
import { useShell } from "./shell-context"
import { useShellSidebar } from "./shell-sidebar-context"

export function ShellSidebarBrand({
  logo,
  homeHref,
  className,
}: {
  logo?: React.ReactNode
  homeHref: string
  className?: string
}): React.ReactElement | null {
  const { Link } = useShell()
  const { toggleSidebar, isTabletIconOnly } = useShellSidebar()

  if (!logo) return null

  const slotClassName = cn(sidebarIconButtonClassName, "absolute inset-0")

  return (
    <div
      className={cn("group/brand relative size-8 shrink-0", className)}
      data-slot="shell-sidebar-brand"
    >
      <Link
        className={cn(
          slotClassName,
          "transition-opacity",
          !isTabletIconOnly &&
            "group-hover/brand:pointer-events-none group-hover/brand:opacity-0"
        )}
        href={homeHref}
      >
        <SidebarLogoMark logo={logo} />
      </Link>
      {!isTabletIconOnly ? (
        <button
          aria-label="Expand sidebar"
          className={cn(
            slotClassName,
            "opacity-0 transition-opacity group-hover/brand:opacity-100"
          )}
          onClick={toggleSidebar}
          type="button"
        >
          <PanelLeftIcon aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}
