import { createAccessControl } from "better-auth/plugins/access"
import {
  defaultStatements as orgDefaultStatements,
  ownerAc,
  adminAc,
  memberAc,
} from "better-auth/plugins/organization/access"

export const statement = {
  ...orgDefaultStatements,
  project: ["create", "read", "update", "delete", "publish", "archive"] as const,
  content: ["create", "read", "update", "delete", "publish"] as const,
  billing: ["read", "manage"] as const,
  analytics: ["read", "export"] as const,
  settings: ["read", "update"] as const,
} as const

export const ac = createAccessControl(statement)

export const ownerRole = ac.newRole({
  ...ownerAc.statements,
  project: ["create", "read", "update", "delete", "publish", "archive"],
  content: ["create", "read", "update", "delete", "publish"],
  billing: ["read", "manage"],
  analytics: ["read", "export"],
  settings: ["read", "update"],
})

export const adminRole = ac.newRole({
  ...adminAc.statements,
  project: ["create", "read", "update", "delete", "publish"],
  content: ["create", "read", "update", "delete", "publish"],
  billing: ["read"],
  analytics: ["read", "export"],
  settings: ["read", "update"],
})

export const memberRole = ac.newRole({
  ...memberAc.statements,
  project: ["create", "read", "update"],
  content: ["create", "read", "update"],
  analytics: ["read"],
  settings: ["read"],
})

export const roles = {
  owner: ownerRole,
  admin: adminRole,
  member: memberRole,
}

export type OrgRoleName = keyof typeof roles
