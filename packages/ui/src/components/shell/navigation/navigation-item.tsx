"use client"

import {
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  RotateCwIcon,
} from "lucide-react"
import type React from "react"
import { Fragment, useState } from "react"
import {
  Drawer,
  DrawerPopup,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer"
import {
  Tooltip,
  TooltipPopup,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import { useShell } from "../shell-context"
import type { NavigationItemType } from "../types"

function readStoredExpansion(itemName: string): boolean | null {
  if (typeof window === "undefined") return null
  try {
    const stored = window.sessionStorage.getItem(`nav-expansion-${itemName}`)
    return stored === null ? null : (JSON.parse(stored) as boolean)
  } catch {
    return null
  }
}

const usePersistedExpansionState = (itemName: string) => {
  const [isExpanded, setIsExpanded] = useState(
    () => readStoredExpansion(itemName) ?? false
  )

  const setPersistedExpansion = (expanded: boolean) => {
    setIsExpanded(expanded)
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(
          `nav-expansion-${itemName}`,
          JSON.stringify(expanded)
        )
      } catch {
        // ignore storage failures
      }
    }
  }

  return [isExpanded, setPersistedExpansion] as const
}

const defaultIsCurrent: NonNullable<NavigationItemType["isCurrent"]> = ({
  isChild,
  item,
  pathname,
}) =>
  isChild
    ? item.href === pathname
    : item.href
      ? (pathname?.startsWith(item.href) ?? false)
      : false

export const NavigationItem: React.FC<{
  index?: number
  item: NavigationItemType
  isChild?: boolean
}> = (props) => {
  const { item, isChild } = props
  const { t, pathname, Link } = useShell()
  const isCurrent = item.isCurrent ?? defaultIsCurrent
  const current = isCurrent({ isChild: !!isChild, item, pathname })
  const [isExpanded, setIsExpanded] = usePersistedExpansionState(item.name)
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  const hasChildren = !!item.child && item.child.length > 0
  const hasActiveChild =
    hasChildren &&
    item.child?.some((child) =>
      isCurrent({ isChild: true, item: child, pathname })
    )
  const shouldShowChildren =
    isExpanded || hasActiveChild || isCurrent({ pathname, isChild, item })
  const shouldShowChevron = hasChildren && !hasActiveChild
  const isParentNavigationItem = hasChildren && !isChild
  const Icon = item.icon

  if (isParentNavigationItem) {
    return (
      <Fragment>
        <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
          <TooltipTrigger
            render={
              <button
                aria-current={current ? "page" : undefined}
                aria-expanded={isExpanded}
                aria-label={t(item.name)}
                className={cn(
                  "group relative mt-0.5 flex w-full items-center rounded-md px-2 py-1.5 text-sm font-medium text-sidebar-foreground transition",
                  "md:justify-center lg:justify-start",
                  "[&[aria-current='page']]:bg-sidebar-accent [&[aria-current='page']]:text-sidebar-accent-foreground",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                onClick={() => setIsExpanded(!isExpanded)}
                type="button"
              />
            }
          >
            {Icon && (
              <div className="relative">
                {item.isLoading ? (
                  <RotateCwIcon className="h-4 w-4 shrink-0 animate-spin lg:mr-2" />
                ) : (
                  <Icon className="h-4 w-4 shrink-0 lg:mr-2" aria-hidden="true" />
                )}
                {shouldShowChevron && (
                  <span className="absolute -right-0.5 -bottom-0.5 rounded-full bg-sidebar-accent p-0.5 lg:hidden">
                    {isExpanded ? (
                      <ChevronUpIcon className="h-2.5 w-2.5" />
                    ) : (
                      <ChevronDownIcon className="h-2.5 w-2.5" />
                    )}
                  </span>
                )}
              </div>
            )}
            <span className="hidden w-full justify-between truncate lg:flex">
              {t(item.name)}
              {item.badge}
            </span>
            {shouldShowChevron &&
              (isExpanded ? (
                <ChevronUpIcon className="ml-auto hidden h-4 w-4 lg:block" />
              ) : (
                <ChevronDownIcon className="ml-auto hidden h-4 w-4 lg:block" />
              ))}
          </TooltipTrigger>
          <TooltipPopup className="lg:hidden" side="right">
            {t(item.name)}
          </TooltipPopup>
        </Tooltip>
        {hasChildren && (
          <div
            aria-hidden={!shouldShowChildren}
            className={cn(
              "grid transition-all duration-300 ease-in-out",
              shouldShowChildren
                ? "visible grid-rows-[1fr] opacity-100"
                : "invisible grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              {item.child?.map((child, index) => (
                <NavigationItem
                  index={index}
                  isChild
                  item={child}
                  key={child.name}
                />
              ))}
            </div>
          </div>
        )}
      </Fragment>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            aria-current={current ? "page" : undefined}
            aria-label={t(item.name)}
            className={cn(
              "group flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-sidebar-foreground transition",
              isChild
                ? cn(
                    "hidden h-8 pl-16 lg:flex lg:pl-11 [&[aria-current='page']]:bg-sidebar-accent [&[aria-current='page']]:text-sidebar-accent-foreground",
                    props.index === 0
                      ? "mt-0"
                      : "mt-1 hover:mt-1 [&[aria-current='page']]:mt-1"
                  )
                : "mt-0.5 md:justify-center lg:justify-start [&[aria-current='page']]:bg-sidebar-accent [&[aria-current='page']]:text-sidebar-accent-foreground",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
            data-test-id={item.name}
            href={item.href}
            target={item.target}
          />
        }
      >
        {Icon &&
          (item.isLoading ? (
            <RotateCwIcon className="h-4 w-4 shrink-0 animate-spin lg:mr-2" />
          ) : (
            <Icon
              aria-hidden="true"
              className="h-4 w-4 shrink-0 lg:mr-2"
            />
          ))}
        <span className="hidden w-full justify-between truncate lg:flex">
          {t(item.name)}
          {item.badge}
        </span>
      </TooltipTrigger>
      <TooltipPopup className="lg:hidden" side="right">
        {t(item.name)}
      </TooltipPopup>
    </Tooltip>
  )
}

export const MobileNavigationItem: React.FC<{
  item: NavigationItemType
  isChild?: boolean
  /** When provided, the item renders as a button (used by the "More" trigger). */
  onClick?: () => void
  isActive?: boolean
}> = (props) => {
  const { item, isChild, onClick, isActive } = props
  const { t, pathname, Link } = useShell()
  const isCurrent = item.isCurrent ?? defaultIsCurrent
  const current = isActive ?? isCurrent({ isChild: !!isChild, item, pathname })
  const Icon = item.icon

  const className =
    "relative my-2 min-w-0 flex-1 overflow-hidden rounded-md bg-transparent! p-1 text-center text-xs font-medium text-muted-foreground hover:text-foreground focus:z-10 sm:text-sm [&[aria-current='page']]:text-foreground"

  const content = (
    <>
      {item.badge ? (
        <div className="absolute top-1 right-1">{item.badge}</div>
      ) : null}
      {Icon ? (
        <Icon
          aria-hidden="true"
          className="mx-auto mb-1 block size-5 shrink-0 text-center text-inherit"
        />
      ) : null}
      <span className="block truncate">{t(item.name)}</span>
    </>
  )

  if (onClick) {
    return (
      <button
        aria-current={current ? "page" : undefined}
        className={className}
        onClick={onClick}
        type="button"
      >
        {content}
      </button>
    )
  }

  return (
    <Link
      aria-current={current ? "page" : undefined}
      className={className}
      href={item.href}
      target={item.target}
    >
      {content}
    </Link>
  )
}

export const MobileNavigationMoreItem: React.FC<{
  item: NavigationItemType
  /** Called after navigating/acting so the parent can close an open drawer. */
  onNavigate?: () => void
}> = (props) => {
  const { item, onNavigate } = props
  const { t, Link } = useShell()

  const Icon = item.icon
  const hasChildren = !!item.child && item.child.length > 0
  const isActionItem = !item.href && item.onClick

  const rowClassName = cn(
    "group flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-sidebar-foreground transition",
    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    "[&[aria-current='page']]:bg-sidebar-accent [&[aria-current='page']]:text-sidebar-accent-foreground"
  )

  const label = (
    <>
      {Icon ? <Icon aria-hidden="true" className="size-4 shrink-0" /> : null}
      <span className="truncate">{t(item.name)}</span>
    </>
  )

  if (hasChildren) {
    return (
      <Drawer>
        <DrawerTrigger
          render={<button className={rowClassName} type="button" />}
        >
          {label}
          <ChevronRightIcon className="ml-auto size-4 shrink-0 text-muted-foreground" />
        </DrawerTrigger>
        <DrawerPopup className="md:hidden" showBar>
          <div className="px-5 pt-4 pb-2">
            <DrawerTitle>{t(item.name)}</DrawerTitle>
          </div>
          <div className="max-h-[70vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
            <nav className="flex flex-col gap-0.5 px-2 pb-4">
              {item.child?.map((childItem) => {
                const ChildIcon = childItem.icon
                return (
                  <Link
                    className={rowClassName}
                    href={childItem.href}
                    key={childItem.name}
                    onClick={onNavigate}
                    target={childItem.target}
                  >
                    {ChildIcon ? (
                      <ChildIcon
                        aria-hidden="true"
                        className="size-4 shrink-0"
                      />
                    ) : null}
                    <span className="truncate">{t(childItem.name)}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </DrawerPopup>
      </Drawer>
    )
  }

  if (isActionItem) {
    return (
      <button
        className={rowClassName}
        onClick={(event) => {
          item.onClick?.(event)
          onNavigate?.()
        }}
        type="button"
      >
        {label}
      </button>
    )
  }

  return (
    <Link
      className={rowClassName}
      href={item.href}
      onClick={onNavigate}
      target={item.target}
    >
      {label}
    </Link>
  )
}
