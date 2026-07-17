import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { Button } from "@workspace/ui-shadcn/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui-shadcn/components/dropdown-menu"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@workspace/ui-shadcn/components/item"
import type { OrganizationRole } from "@/features/organization/hooks/use-organization-roles"
import {
  countPermissions,
  formatRoleLabel,
} from "@/features/organization/lib/organization-roles"
import { PermissionChips } from "./permission-chips"

type CustomRolesListProps = {
  readonly canDeleteRoles: boolean
  readonly canUpdateRoles: boolean
  readonly customRoles: readonly OrganizationRole[]
  readonly onDelete: (role: OrganizationRole) => void
  readonly onEdit: (role: OrganizationRole) => void
}

function RoleActionsMenu({
  canDeleteRoles,
  canUpdateRoles,
  role,
  onDelete,
  onEdit,
}: {
  readonly canDeleteRoles: boolean
  readonly canUpdateRoles: boolean
  readonly role: OrganizationRole
  readonly onDelete: (role: OrganizationRole) => void
  readonly onEdit: (role: OrganizationRole) => void
}) {
  if (!canUpdateRoles && !canDeleteRoles) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label={`Actions for ${role.role}`}
            size="icon-sm"
            type="button"
            variant="outline"
          />
        }
      >
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canUpdateRoles ? (
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onEdit(role)}>
              <Pencil />
              Edit role
            </DropdownMenuItem>
          </DropdownMenuGroup>
        ) : null}
        {canUpdateRoles && canDeleteRoles ? <DropdownMenuSeparator /> : null}
        {canDeleteRoles ? (
          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(role)}
            >
              <Trash2 />
              Delete role
            </DropdownMenuItem>
          </DropdownMenuGroup>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function CustomRolesList({
  canDeleteRoles,
  canUpdateRoles,
  customRoles,
  onDelete,
  onEdit,
}: CustomRolesListProps) {
  return (
    <ItemGroup>
      {customRoles.map((role) => {
        const total = countPermissions(role.permission)
        return (
          <Item key={role.id} role="listitem" variant="outline">
            <ItemContent>
              <ItemTitle>{formatRoleLabel(role.role)}</ItemTitle>
              <ItemDescription>
                {total} permission{total === 1 ? "" : "s"}
              </ItemDescription>
              <PermissionChips permission={role.permission} />
            </ItemContent>
            <ItemActions>
              <RoleActionsMenu
                canDeleteRoles={canDeleteRoles}
                canUpdateRoles={canUpdateRoles}
                role={role}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            </ItemActions>
          </Item>
        )
      })}
    </ItemGroup>
  )
}
