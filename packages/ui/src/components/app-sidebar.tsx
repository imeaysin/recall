"use client"

import type { ComponentProps, ElementType, ReactNode } from "react"
import { useState } from "react"
import {
  ArrowUpDownIcon,
  ChevronRightIcon,
  CommandIcon,
  ListFilterIcon,
  PlusIcon,
} from "lucide-react"
import { NavUser } from "@workspace/ui/components/nav-user"
import { Button } from "@workspace/ui/components/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"

export type AppSidebarSecondaryItem = {
  title: string
  url: string
  icon?: ReactNode
  isActive?: boolean
  count?: number | string
  emphasis?: "default" | "muted"
  items?: AppSidebarSecondaryItem[]
}

export type AppSidebarNavItem = {
  title: string
  url: string
  icon?: ReactNode
  isActive?: boolean
  items?: AppSidebarSecondaryItem[]
}

export type AppSidebarProject = {
  name: string
  url: string
  icon: ReactNode
  isActive?: boolean
}

export type AppSidebarTeam = {
  id: string
  name: string
  logo: ReactNode
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
  icon?: ReactNode
  onClick?: () => void
}

export type AppSidebarBrand = {
  name: string
  plan?: string
  logo?: ReactNode
}

export type AppSidebarSecondaryAction = {
  label: string
  href?: string
  onClick?: () => void
  disabled?: boolean
}

export type AppSidebarProps = ComponentProps<typeof Sidebar> & {
  user: AppSidebarUser
  teams?: AppSidebarTeam[]
  brand?: AppSidebarBrand
  navMain: AppSidebarNavItem[]
  projects?: AppSidebarProject[]
  userMenuItems?: AppSidebarUserMenuItem[]
  secondaryAction?: AppSidebarSecondaryAction
  activeTeamId?: string | null
  onSignOut?: () => void
  onTeamChange?: (team: AppSidebarTeam) => void
  onAddTeam?: () => void
  linkComponent?: ElementType
  navLabel?: string
  projectsLabel?: string
}

type SecondarySort = "default" | "name" | "count"

function nextSort(current: SecondarySort): SecondarySort {
  if (current === "default") return "name"
  if (current === "name") return "count"
  return "default"
}

function prepareSecondaryItems(
  items: AppSidebarSecondaryItem[],
  options: { hideEmpty: boolean; sort: SecondarySort }
) {
  const visible = options.hideEmpty
    ? items.filter((item) => item.count === undefined || Number(item.count) > 0)
    : items

  if (options.sort === "default") return visible

  const sorted = [...visible]
  if (options.sort === "name") {
    sorted.sort((a, b) => a.title.localeCompare(b.title))
    return sorted
  }
  sorted.sort((a, b) => Number(b.count ?? 0) - Number(a.count ?? 0))
  return sorted
}

function SecondaryNavItem({
  item,
  LinkComponent,
}: {
  item: AppSidebarSecondaryItem
  LinkComponent: ElementType
}) {
  const children = item.items ?? []
  const hasChildren = children.length > 0
  const [open, setOpen] = useState(
    () => item.isActive || children.some((child) => child.isActive)
  )

  const titleClassName = cn("truncate", item.emphasis === "muted" && "italic")

  if (!hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={item.isActive}
          tooltip={item.title}
          render={<LinkComponent href={item.url} />}
        >
          {item.icon}
          <span className={titleClassName}>{item.title}</span>
          {item.count !== undefined ? (
            <SidebarMenuBadge>{item.count}</SidebarMenuBadge>
          ) : null}
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <div className="flex w-full items-center gap-0.5">
          <CollapsibleTrigger
            render={
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="size-7 shrink-0 text-muted-foreground"
                aria-label={open ? "Collapse" : "Expand"}
              />
            }
          >
            <ChevronRightIcon
              className={cn("size-4 transition-transform", open && "rotate-90")}
            />
          </CollapsibleTrigger>
          <SidebarMenuButton
            isActive={item.isActive}
            tooltip={item.title}
            className="flex-1"
            render={<LinkComponent href={item.url} />}
          >
            {item.icon}
            <span className={titleClassName}>{item.title}</span>
            {item.count !== undefined ? (
              <SidebarMenuBadge>{item.count}</SidebarMenuBadge>
            ) : null}
          </SidebarMenuButton>
        </div>
        <CollapsibleContent>
          <SidebarMenuSub>
            {children.map((child) => (
              <SidebarMenuSubItem key={`${child.url}-${child.title}`}>
                <SidebarMenuSubButton
                  isActive={child.isActive}
                  render={<LinkComponent href={child.url} />}
                >
                  {child.icon}
                  <span
                    className={cn(
                      "truncate",
                      child.emphasis === "muted" && "italic"
                    )}
                  >
                    {child.title}
                  </span>
                  {child.count !== undefined ? (
                    <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                      {child.count}
                    </span>
                  ) : null}
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

function SecondaryAddButton({
  action,
  LinkComponent,
}: {
  action?: AppSidebarSecondaryAction
  LinkComponent: ElementType
}) {
  if (action?.href) {
    return (
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label={action.label}
        disabled={action.disabled}
        nativeButton={false}
        render={<LinkComponent href={action.href} />}
      >
        <PlusIcon />
      </Button>
    )
  }

  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      aria-label={action?.label ?? "Add"}
      disabled={!action || action.disabled}
      onClick={action?.onClick}
    >
      <PlusIcon />
    </Button>
  )
}

/**
 * Dual-pane shell: icon rail + knowledge-tree secondary pane.
 */
export function AppSidebar({
  user,
  teams = [],
  brand,
  navMain,
  userMenuItems,
  secondaryAction,
  onSignOut,
  linkComponent: LinkComponent = "a",
  ...props
}: AppSidebarProps) {
  const { setOpen } = useSidebar()
  const [sort, setSort] = useState<SecondarySort>("default")
  const [hideEmpty, setHideEmpty] = useState(false)

  const activeTeam = teams[0]
  const brandName = brand?.name ?? activeTeam?.name ?? "App"
  const brandPlan = brand?.plan ?? activeTeam?.plan ?? ""
  const brandLogo = brand?.logo ?? activeTeam?.logo ?? <CommandIcon />
  const activeItem = navMain.find((item) => item.isActive) ?? navMain[0] ?? null
  const secondaryItems = prepareSecondaryItems(activeItem?.items ?? [], {
    hideEmpty,
    sort,
  })

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      <Sidebar
        collapsible="none"
        className="h-full w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
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
                      onClick={() => setOpen(true)}
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

      <Sidebar
        collapsible="none"
        className="hidden h-full min-h-0 flex-1 overflow-hidden md:flex"
      >
        <SidebarHeader className="flex shrink-0 flex-row items-center justify-between gap-1 border-b px-2 py-2">
          <SecondaryAddButton
            action={secondaryAction}
            LinkComponent={LinkComponent}
          />
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              size="icon-sm"
              variant={hideEmpty ? "secondary" : "ghost"}
              aria-label={
                hideEmpty ? "Show empty folders" : "Hide empty folders"
              }
              aria-pressed={hideEmpty}
              onClick={() => setHideEmpty((value) => !value)}
            >
              <ListFilterIcon />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant={sort === "default" ? "ghost" : "secondary"}
              aria-label={`Sort: ${sort}`}
              onClick={() => setSort(nextSort)}
            >
              <ArrowUpDownIcon />
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {secondaryItems.length === 0 ? (
            <Empty className="border-0">
              <EmptyHeader>
                <EmptyTitle>Nothing here yet</EmptyTitle>
                <EmptyDescription>
                  Items for this section will show up here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <SidebarGroup className="px-2 py-2">
              <SidebarGroupContent>
                <SidebarMenu>
                  {secondaryItems.map((item) => (
                    <SecondaryNavItem
                      key={`${item.url}-${item.title}`}
                      item={item}
                      LinkComponent={LinkComponent}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}
