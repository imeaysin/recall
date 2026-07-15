import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access"
import { createAccessControl } from "better-auth/plugins/access"

const MEMBER_ACTIONS = ["create", "read", "update", "delete"] as const

const statement = {
  ...defaultStatements,
  member: MEMBER_ACTIONS,
  project: ["create", "read", "update", "delete", "publish", "archive"],
  report: ["create", "read", "update", "delete", "export"],
  invoice: ["create", "read", "update", "delete", "approve"],
  settings: ["read", "update"],
} as const

export const ac = createAccessControl(statement)

export const ownerRole = ac.newRole({
  ...ownerAc.statements,
  member: MEMBER_ACTIONS,
  project: ["create", "read", "update", "delete", "publish", "archive"],
  report: ["create", "read", "update", "delete", "export"],
  invoice: ["create", "read", "update", "delete", "approve"],
  settings: ["read", "update"],
})

export const adminRole = ac.newRole({
  ...adminAc.statements,
  member: ["create", "read", "update"],
  project: ["create", "read", "update", "delete"],
  report: ["create", "read", "update", "export"],
  invoice: ["create", "read", "update", "approve"],
  settings: ["read", "update"],
})

export const memberRole = ac.newRole({
  ...memberAc.statements,
  member: ["read"],
  project: ["create", "read", "update"],
  report: ["create", "read"],
  invoice: ["read"],
  settings: ["read"],
})

export const viewerRole = ac.newRole({
  ...memberAc.statements,
  member: ["read"],
  project: ["read"],
  report: ["read"],
  invoice: ["read"],
  settings: ["read"],
})

export const organizationRoles = {
  owner: ownerRole,
  admin: adminRole,
  member: memberRole,
  viewer: viewerRole,
} as const

export const platformRoles = {
  admin: adminRole,
  user: memberRole,
} as const
