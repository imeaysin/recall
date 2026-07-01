"use client"

import type { OrganizationPermissionMap } from "@workspace/auth/permissions/organization"
import {
  formatOrganizationPermissionLabel,
  hasOrganizationPermission,
  organizationPermissionMatrix,
  toggleOrganizationPermission,
} from "@workspace/auth/permissions/organization"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Label } from "@workspace/ui/components/label"
import { cn } from "@workspace/ui/lib/utils"

export interface OrganizationRolePermissionsProps {
  className?: string
  permissions: OrganizationPermissionMap
  onChange?: (permissions: OrganizationPermissionMap) => void
  disabled?: boolean
}

export function OrganizationRolePermissions({
  className,
  permissions,
  onChange,
  disabled = false,
}: OrganizationRolePermissionsProps) {
  const readOnly = disabled || !onChange

  return (
    <div
      className={cn("flex max-h-72 flex-col gap-4 overflow-y-auto", className)}
    >
      {organizationPermissionMatrix.map(({ resource, actions }) => (
        <div className="flex flex-col gap-2" key={resource}>
          <p className="text-sm font-medium">
            {formatOrganizationPermissionLabel(resource)}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {actions.map((action) => {
              const checked = hasOrganizationPermission(
                permissions,
                resource,
                action
              )
              const id = `role-permission-${resource}-${action}`

              return (
                <Label
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-normal",
                    readOnly && "opacity-80"
                  )}
                  htmlFor={id}
                  key={id}
                >
                  <Checkbox
                    checked={checked}
                    disabled={readOnly}
                    id={id}
                    onCheckedChange={(nextChecked) => {
                      if (!onChange) return
                      onChange(
                        toggleOrganizationPermission(
                          permissions,
                          resource,
                          action,
                          nextChecked === true
                        )
                      )
                    }}
                  />
                  {formatOrganizationPermissionLabel(action)}
                </Label>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
