"use client"

import type { OrganizationPermissionMap } from "@workspace/auth/permissions/organization"
import {
  formatOrganizationPermissionLabel,
  hasOrganizationPermission,
  organizationPermissionMatrix,
  toggleOrganizationPermission,
} from "@workspace/auth/permissions/organization"
import { Check } from "lucide-react"
import { Toggle } from "@workspace/ui/components/toggle"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

const ACTION_COLUMN_ORDER = [
  "create",
  "read",
  "update",
  "delete",
  "publish",
  "archive",
  "manage",
  "export",
  "cancel",
] as const

const actionColumns = ACTION_COLUMN_ORDER.filter((action) =>
  organizationPermissionMatrix.some(({ actions }) =>
    (actions as readonly string[]).includes(action)
  )
)

export type OrganizationRolePermissionsProps = {
  className?: string
  permissions: OrganizationPermissionMap
  onChange?: (permissions: OrganizationPermissionMap) => void
  disabled?: boolean
}

type PermissionCellProps = {
  actionLabel: string
  checked: boolean
  disabled: boolean
  onToggle: (enabled: boolean) => void
  resourceLabel: string
}

function PermissionCell({
  actionLabel,
  checked,
  disabled,
  onToggle,
  resourceLabel,
}: PermissionCellProps) {
  return (
    <TableCell className="w-11 p-0.5">
      <Toggle
        aria-label={`${resourceLabel} ${actionLabel}`}
        className={cn(
          "size-7 min-w-full border-dashed p-0 text-primary",
          "data-pressed:border-primary data-pressed:bg-primary/10 data-pressed:text-primary"
        )}
        disabled={disabled}
        onPressedChange={onToggle}
        pressed={checked}
        size="sm"
        variant="outline"
      >
        <Check
          aria-hidden
          className={cn("size-3.5 shrink-0", !checked && "opacity-0")}
        />
      </Toggle>
    </TableCell>
  )
}

export function OrganizationRolePermissions({
  className,
  permissions,
  onChange,
  disabled = false,
}: OrganizationRolePermissionsProps) {
  const readOnly = disabled || !onChange

  return (
    <Table
      aria-label="Role permissions"
      className={cn("rounded-lg border", className)}
    >
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="h-8 w-0 max-w-16 px-2" />
          {actionColumns.map((action) => (
            <TableHead
              className="h-8 w-11 px-0 text-center text-[11px] font-normal"
              key={action}
            >
              {formatOrganizationPermissionLabel(action)}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {organizationPermissionMatrix.map((row) => {
          const resourceLabel = formatOrganizationPermissionLabel(row.resource)

          return (
            <TableRow className="hover:bg-transparent" key={row.resource}>
              <TableCell
                className="w-0 max-w-16 truncate py-1.5 ps-2 pe-1 text-xs font-medium text-muted-foreground"
                title={resourceLabel}
              >
                {resourceLabel}
              </TableCell>
              {actionColumns.map((action) => {
                if (!(row.actions as readonly string[]).includes(action)) {
                  return <TableCell className="w-11 p-0.5" key={action} />
                }

                const checked = hasOrganizationPermission(
                  permissions,
                  row.resource,
                  action as (typeof row.actions)[number]
                )
                const actionLabel = formatOrganizationPermissionLabel(action)

                return (
                  <PermissionCell
                    actionLabel={actionLabel}
                    checked={checked}
                    disabled={readOnly}
                    key={action}
                    onToggle={(enabled) => {
                      if (!onChange) return
                      onChange(
                        toggleOrganizationPermission(
                          permissions,
                          row.resource,
                          action as (typeof row.actions)[number],
                          enabled
                        )
                      )
                    }}
                    resourceLabel={resourceLabel}
                  />
                )
              })}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
