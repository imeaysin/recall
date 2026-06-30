"use client"

import { PanelLeftCloseIcon } from "lucide-react"
import type React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { sidebarHeaderActionClassName } from "./navigation/navigation-styles"
import { useShellSidebar } from "./shell-sidebar-context"

export function ShellSidebarTrigger({
  className,
  ...props
}: React.ComponentProps<"button">): React.ReactElement | null {
  const { toggleSidebar, isTabletIconOnly } = useShellSidebar()

  if (isTabletIconOnly) return null

  return (
    <button
      aria-label="Collapse sidebar"
      className={cn(sidebarHeaderActionClassName, className)}
      data-slot="shell-sidebar-trigger"
      onClick={toggleSidebar}
      type="button"
      {...props}
    >
      <PanelLeftCloseIcon aria-hidden="true" />
    </button>
  )
}
