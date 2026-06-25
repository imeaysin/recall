import { createAccessControl } from "better-auth/plugins/access"
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access"

export const statement = {
  ...defaultStatements,
  project: ["create", "read", "update", "delete", "publish", "archive"] as const,
  content: ["create", "read", "update", "delete", "publish"] as const,
  billing: ["read", "manage"] as const,
  analytics: ["read", "export"] as const,
  settings: ["read", "update"] as const,
  team: ["invite", "remove", "update-role"] as const,
} as const

export const ac = createAccessControl(statement)

export const guestRole = ac.newRole({
  project: ["read"],
  content: ["read"],
})

export const userRole = ac.newRole({
  ...adminAc.statements,
  project: ["create", "read", "update"],
  content: ["create", "read", "update", "delete"],
  analytics: ["read"],
  settings: ["read", "update"],
})

export const managerRole = ac.newRole({
  ...userRole.statements,
  project: ["create", "read", "update", "delete", "publish"],
  billing: ["read"],
  analytics: ["read", "export"],
  team: ["invite", "remove"],
})

export const adminRole = ac.newRole({
  ...adminAc.statements,
  project: ["create", "read", "update", "delete", "publish", "archive"],
  content: ["create", "read", "update", "delete", "publish"],
  billing: ["read", "manage"],
  analytics: ["read", "export"],
  settings: ["read", "update"],
  team: ["invite", "remove", "update-role"],
})

export const roles = { guestRole, userRole, managerRole, adminRole }
export type RoleName = "guest" | "user" | "manager" | "admin"
