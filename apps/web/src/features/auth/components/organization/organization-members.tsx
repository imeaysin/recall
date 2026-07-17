"use client"

import {
  type OrganizationAuthClient,
  useActiveOrganization,
  useAuth,
  useAuthPlugin,
  useHasPermission,
  useListOrganizationMembers,
  useSession,
} from "@better-auth-ui/react"
import type { Member } from "better-auth/client"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui-shadcn/components/empty"
import { Badge } from "@workspace/ui-shadcn/components/badge"
import { Button, buttonVariants } from "@workspace/ui-shadcn/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@workspace/ui-shadcn/components/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui-shadcn/components/input-group"
import { ItemGroup } from "@workspace/ui-shadcn/components/item"
import { Filter, Search, Users, X } from "lucide-react"
import { type ComponentProps, useMemo, useState } from "react"

import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { cn } from "@workspace/ui-shadcn/lib/utils"
import { SectionHeader } from "@/components/page-header"
import { InviteMemberDialog } from "@/features/auth/components/organization/invite-member-dialog"
import { OrganizationMemberRow } from "@/features/auth/components/organization/organization-member-row"
import { OrganizationMemberRowSkeleton } from "@/features/auth/components/organization/organization-member-row-skeleton"

type SortDirection = "ascending" | "descending"

type SortDescriptor = {
  column: string
  direction: SortDirection
}

/** Props for the `OrganizationMembers` component. */
export type OrganizationMembersProps = {
  className?: string
  hideInvite?: boolean
}

/**
 * Organization members list with filters and per-row actions.
 */
export function OrganizationMembers({
  className,
  hideInvite,
  ...props
}: OrganizationMembersProps & ComponentProps<"div">) {
  const { authClient } = useAuth()
  const { localization: organizationLocalization, roles } =
    useAuthPlugin(organizationPlugin)

  const { data: session } = useSession(authClient)
  const { data: activeOrganization, isPending: activeOrganizationPending } =
    useActiveOrganization(authClient as OrganizationAuthClient)
  const { data: membersData, isPending: membersPending } =
    useListOrganizationMembers(authClient as OrganizationAuthClient)

  const { isPending: updatePermissionPending } = useHasPermission(
    authClient as OrganizationAuthClient,
    {
      permissions: { member: ["update"] },
    }
  )
  const { isPending: deletePermissionPending } = useHasPermission(
    authClient as OrganizationAuthClient,
    {
      permissions: { member: ["delete"] },
    }
  )

  const isPending =
    activeOrganizationPending ||
    membersPending ||
    updatePermissionPending ||
    deletePermissionPending

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>()
  const [roleFilter, setRoleFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [inviteOpen, setInviteOpen] = useState(false)

  const filteredMembers = useMemo(() => {
    return membersData?.members.filter(
      (member) =>
        (roleFilter === "all" || member.role === roleFilter) &&
        (member.user.name.toLowerCase().includes(search.toLowerCase()) ||
          member.user.email.toLowerCase().includes(search.toLowerCase()))
    )
  }, [search, membersData?.members, roleFilter])

  const sortedMembers = useMemo(() => {
    if (!sortDescriptor) return filteredMembers
    if (!filteredMembers) return filteredMembers

    return [...filteredMembers].sort((a, b) => {
      const col = sortDescriptor.column as keyof Member | "user"
      const first =
        col === "user" ? a.user.name || a.user.email : String(a[col])
      const second =
        col === "user" ? b.user.name || b.user.email : String(b[col])

      let cmp = first.localeCompare(second)
      if (sortDescriptor.direction === "descending") {
        cmp *= -1
      }

      return cmp
    })
  }, [sortDescriptor, filteredMembers])

  const isOwner = membersData?.members.some(
    (member) => member.role === "owner" && member.userId === session?.user.id
  )

  const hasMembers = (membersData?.members.length ?? 0) > 0
  const showEmptySearch =
    !isPending && hasMembers && (sortedMembers?.length ?? 0) === 0
  const showEmptyInitial = !isPending && !hasMembers

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <SectionHeader
        actions={
          !hideInvite ? (
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => setInviteOpen(true)}
            >
              {organizationLocalization.inviteMember}
            </Button>
          ) : null
        }
        title={organizationLocalization.members}
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <InputGroup className="min-w-0 sm:w-[220px]">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={organizationLocalization.search}
              placeholder={organizationLocalization.search}
              disabled={isPending}
            />
          </InputGroup>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
              disabled={isPending}
            >
              <Filter />
              {organizationLocalization.role}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuRadioGroup
                value={roleFilter}
                onValueChange={setRoleFilter}
              >
                <DropdownMenuRadioItem value="all">
                  {organizationLocalization.all}
                </DropdownMenuRadioItem>
                {Object.entries(roles).map(([role, label]) => (
                  <DropdownMenuRadioItem key={role} value={role}>
                    {label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
              disabled={isPending}
            >
              Sort
              {sortDescriptor
                ? `: ${sortDescriptor.column === "user" ? "Name" : "Role"}`
                : null}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuRadioGroup
                value={
                  sortDescriptor
                    ? `${sortDescriptor.column}-${sortDescriptor.direction}`
                    : "none"
                }
                onValueChange={(value) => {
                  if (value === "none") {
                    setSortDescriptor(undefined)
                    return
                  }
                  const [column, direction] = value.split("-") as [
                    string,
                    SortDirection,
                  ]
                  setSortDescriptor({ column, direction })
                }}
              >
                <DropdownMenuRadioItem value="none">
                  Default
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="user-ascending">
                  Name A–Z
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="user-descending">
                  Name Z–A
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="role-ascending">
                  Role A–Z
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="role-descending">
                  Role Z–A
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {roleFilter !== "all" ? (
          <Badge variant="secondary" className="w-fit gap-1">
            {organizationLocalization.role}:{" "}
            <span className="capitalize">
              {roles?.[roleFilter] ?? roleFilter}
            </span>
            <button
              type="button"
              aria-label={organizationLocalization.clear}
              className="inline-flex cursor-pointer items-center text-muted-foreground hover:text-foreground"
              onClick={() => setRoleFilter("all")}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ) : null}

        {isPending ? (
          <ItemGroup>
            <OrganizationMemberRowSkeleton />
            <OrganizationMemberRowSkeleton />
            <OrganizationMemberRowSkeleton />
          </ItemGroup>
        ) : null}

        {showEmptyInitial || showEmptySearch ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>
                {showEmptySearch
                  ? "No matching members"
                  : organizationLocalization.members}
              </EmptyTitle>
              <EmptyDescription>
                {showEmptySearch
                  ? "Try a different search or clear filters."
                  : "Invite teammates to collaborate in this organization."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}

        {!isPending &&
        activeOrganization &&
        sortedMembers &&
        sortedMembers.length > 0 ? (
          <ItemGroup>
            {sortedMembers.map((member) => (
              <OrganizationMemberRow
                key={member.id}
                member={member}
                isOwner={isOwner}
                organization={activeOrganization}
              />
            ))}
          </ItemGroup>
        ) : null}
      </div>

      {!hideInvite ? (
        <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />
      ) : null}
    </div>
  )
}
