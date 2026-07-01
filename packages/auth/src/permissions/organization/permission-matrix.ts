import type { ActionName, PermissionMapFor, ResourceName } from "../types"
import { statement, type OrganizationStatement } from "./statement"

type OrganizationResource = ResourceName<OrganizationStatement>
type OrganizationAction<R extends OrganizationResource> = ActionName<
  OrganizationStatement,
  R
>
type OrganizationPermissionMap = PermissionMapFor<OrganizationStatement>

function isOrganizationResource(
  resource: string
): resource is OrganizationResource {
  return resource in statement
}

export const organizationPermissionMatrix = Object.keys(statement).flatMap(
  (resource) => {
    if (!isOrganizationResource(resource)) return []
    return [
      {
        resource,
        actions: [...statement[resource]],
      },
    ]
  }
)

export const reservedOrganizationRoleNames = [
  "owner",
  "admin",
  "member",
] as const

export function formatOrganizationPermissionLabel(value: string) {
  return value
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function isReservedOrganizationRoleName(role: string) {
  const normalized = role.trim().toLowerCase()
  return reservedOrganizationRoleNames.some((name) => name === normalized)
}

export function toggleOrganizationPermission<R extends OrganizationResource>(
  permissions: OrganizationPermissionMap,
  resource: R,
  action: OrganizationAction<R>,
  enabled: boolean
): OrganizationPermissionMap {
  const currentActions = permissions[resource] ?? []

  if (enabled) {
    return {
      ...permissions,
      [resource]: [...new Set([...currentActions, action])],
    }
  }

  const nextActions = currentActions.filter((entry) => entry !== action)
  if (nextActions.length === 0) {
    const { [resource]: _removed, ...rest } = permissions
    return rest
  }

  return {
    ...permissions,
    [resource]: nextActions,
  }
}

export function hasOrganizationPermission<R extends OrganizationResource>(
  permissions: OrganizationPermissionMap,
  resource: R,
  action: OrganizationAction<R>
) {
  return permissions[resource]?.includes(action) ?? false
}

export function countOrganizationPermissions(
  permissions: OrganizationPermissionMap
) {
  return Object.values(permissions).reduce(
    (total, actions) => total + (actions?.length ?? 0),
    0
  )
}
