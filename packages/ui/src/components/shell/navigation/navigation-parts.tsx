"use client"

import { ChevronDownIcon, ChevronUpIcon, RotateCwIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type React from "react"
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuLinkItem,
  MenuPopup,
  MenuTrigger,
} from "@workspace/ui/components/menu"
import { cn } from "@workspace/ui/lib/utils"
import { useShell } from "../shell-context"
import type { NavigationItemType } from "../types"
import {
  defaultIsCurrent,
  sidebarChevronClassName,
  sidebarMenuSubClassName,
  sidebarNavItemClassName,
} from "./navigation-styles"

const navIconClassName = "size-4 shrink-0"

export function NavItemIcon({
  icon: Icon,
  isLoading,
  className = navIconClassName,
}: {
  icon?: LucideIcon
  isLoading?: boolean
  className?: string
}): React.ReactElement | null {
  if (isLoading) {
    return <RotateCwIcon className={cn(className, "animate-spin")} />
  }

  if (!Icon) return null

  return <Icon aria-hidden="true" className={className} />
}

export function ExpansionChevron({
  expanded,
  className = sidebarChevronClassName,
}: {
  expanded: boolean
  className?: string
}): React.ReactElement {
  const Icon = expanded ? ChevronUpIcon : ChevronDownIcon
  return <Icon aria-hidden="true" className={className} />
}

export function NavigationChildPanel({
  open,
  children,
}: {
  open: boolean
  children: React.ReactNode
}): React.ReactElement {
  return (
    <div
      aria-hidden={!open}
      className={cn(
        "grid transition-all duration-300 ease-in-out",
        open
          ? "visible grid-rows-[1fr] opacity-100"
          : "invisible grid-rows-[0fr] opacity-0"
      )}
    >
      <div className="overflow-hidden">
        <ul className={sidebarMenuSubClassName}>{children}</ul>
      </div>
    </div>
  )
}

/** Icon-only sidebar (md–lg): flyout menu for parents, matching shadcn collapsible=icon. */
export function SidebarIconParentNavItem({
  item,
  hasActiveChild,
}: {
  item: NavigationItemType
  hasActiveChild: boolean
}): React.ReactElement {
  const { t, pathname, Link } = useShell()
  const isCurrent = item.isCurrent ?? defaultIsCurrent

  return (
    <Menu>
      <MenuTrigger
        render={
          <button
            aria-haspopup="menu"
            aria-label={t(item.name)}
            className={sidebarNavItemClassName}
            data-active={hasActiveChild ? true : undefined}
            type="button"
          />
        }
      >
        <NavItemIcon icon={item.icon} isLoading={item.isLoading} />
      </MenuTrigger>
      <MenuPopup align="start" className="min-w-44" side="right" sideOffset={8}>
        <MenuGroup>
          <MenuGroupLabel>{t(item.name)}</MenuGroupLabel>
          {item.child?.map((child) => {
            const ChildIcon = child.icon
            const childCurrent = isCurrent({
              isChild: true,
              item: child,
              pathname,
            })

            return (
              <MenuLinkItem
                aria-current={childCurrent ? "page" : undefined}
                key={child.name}
                render={<Link href={child.href} target={child.target} />}
              >
                {ChildIcon ? (
                  <ChildIcon aria-hidden="true" className="size-4 shrink-0" />
                ) : null}
                {t(child.name)}
              </MenuLinkItem>
            )
          })}
        </MenuGroup>
      </MenuPopup>
    </Menu>
  )
}
