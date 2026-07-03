import { createAccessControl } from "better-auth/plugins/access"
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access"
import type { PlatformRoleName } from "../../config/admin-plugin"
import { businessStatement } from "../business/statement"
import { platformGrants } from "../business/grants"
import type {
  ActionName,
  PermissionMapFor,
  RequiredPermission,
  ResourceName,
} from "../types"

export const statement = {
  ...defaultStatements,
  ...businessStatement,
  team: ["invite", "remove", "update-role"] as const,
} as const

export type PlatformStatement = typeof statement
export type PlatformResource = ResourceName<PlatformStatement>
export type PlatformAction<R extends PlatformResource> = ActionName<
  PlatformStatement,
  R
>
export type PlatformPermissionMap = PermissionMapFor<PlatformStatement>
export type PlatformPermissionCheck = {
  permissions: PlatformPermissionMap
}
export type PlatformRequiredPermission<
  R extends PlatformResource = PlatformResource,
> = RequiredPermission<PlatformStatement, R>

export const ac = createAccessControl(statement)

export const guestRole = ac.newRole(platformGrants.guest)

export const userRole = ac.newRole({
  ...adminAc.statements,
  ...platformGrants.user,
})

export const managerRole = ac.newRole({
  ...userRole.statements,
  ...platformGrants.manager,
  team: ["invite", "remove"],
})

export const adminRole = ac.newRole({
  ...adminAc.statements,
  ...platformGrants.owner,
  team: ["invite", "remove", "update-role"],
})

export const platformRoles = {
  guest: guestRole,
  user: userRole,
  manager: managerRole,
  admin: adminRole,
} as const

export const platformRoleNames = [
  "guest",
  "user",
  "manager",
  "admin",
] as const satisfies readonly PlatformRoleName[]

function isPlatformRoleName(role: string): role is PlatformRoleName {
  return role in platformRoles
}

export function formatPlatformRoleLabel(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

function isPlatformResource(resource: string): resource is PlatformResource {
  return resource in statement
}

export function checkPlatformPermissionMap(
  platformRole: string | null | undefined,
  permissions: PlatformPermissionMap
): boolean {
  if (!platformRole) return false

  for (const resource of Object.keys(permissions)) {
    if (!isPlatformResource(resource)) continue

    const actions = permissions[resource]
    if (!actions) continue

    for (const action of actions) {
      if (!checkPlatformPermission(platformRole, resource, action)) {
        return false
      }
    }
  }

  return true
}

export function createPlatformPermissionResult(success: boolean) {
  return { error: null, success }
}

export function checkPlatformPermission<R extends PlatformResource>(
  platformRole: string,
  resource: R,
  action: PlatformAction<R>
): boolean {
  if (!isPlatformRoleName(platformRole)) return false

  return platformRoles[platformRole].authorize({ [resource]: [action] }).success
}
