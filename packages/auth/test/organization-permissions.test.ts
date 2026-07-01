import { describe, expect, it } from "vitest"
import {
  canAssignOrganizationRole,
  checkOrganizationPermission,
  checkOrganizationPermissionMap,
  formatOrganizationRoleLabel,
  getOrganizationRoleNames,
  parseOrganizationRoles,
  resolveAssignableOrganizationRoles,
} from "../src/permissions/organization"

describe("checkOrganizationPermission", () => {
  it("grants owners full organization management", () => {
    expect(checkOrganizationPermission("owner", "organization", "delete")).toBe(
      true
    )
    expect(checkOrganizationPermission("owner", "member", "update")).toBe(true)
    expect(checkOrganizationPermission("owner", "invitation", "create")).toBe(
      true
    )
  })

  it("limits members to read-oriented actions", () => {
    expect(checkOrganizationPermission("member", "member", "update")).toBe(
      false
    )
    expect(checkOrganizationPermission("member", "invitation", "create")).toBe(
      false
    )
    expect(checkOrganizationPermission("member", "project", "read")).toBe(true)
  })

  it("allows admins to invite but not delete the workspace", () => {
    expect(checkOrganizationPermission("admin", "invitation", "create")).toBe(
      true
    )
    expect(checkOrganizationPermission("admin", "organization", "delete")).toBe(
      false
    )
  })

  it("supports comma-separated role strings", () => {
    expect(
      checkOrganizationPermission("member,admin", "invitation", "create")
    ).toBe(true)
  })

  it("denies access when no organization role is present", () => {
    expect(checkOrganizationPermission(null, "project", "read")).toBe(false)
  })
})

describe("canAssignOrganizationRole", () => {
  it("only lets owners assign the owner role", () => {
    expect(canAssignOrganizationRole("owner", "owner")).toBe(true)
    expect(canAssignOrganizationRole("admin", "owner")).toBe(false)
    expect(canAssignOrganizationRole("member", "owner")).toBe(false)
  })

  it("allows non-owner role assignment for any assigner", () => {
    expect(canAssignOrganizationRole("admin", "member")).toBe(true)
    expect(canAssignOrganizationRole("member", "member")).toBe(true)
  })
})

describe("getOrganizationRoleNames", () => {
  it("always includes built-in roles and merges dynamic roles", () => {
    expect(getOrganizationRoleNames()).toEqual(["owner", "admin", "member"])
    expect(getOrganizationRoleNames([])).toEqual(["owner", "admin", "member"])
    expect(getOrganizationRoleNames([{ role: "moderator" }])).toEqual([
      "owner",
      "admin",
      "member",
      "moderator",
    ])
  })
})

describe("checkOrganizationPermissionMap", () => {
  it("checks every action in a permission map", () => {
    expect(
      checkOrganizationPermissionMap("owner", {
        invitation: ["create"],
        member: ["update"],
      })
    ).toBe(true)
    expect(
      checkOrganizationPermissionMap("member", {
        invitation: ["create"],
      })
    ).toBe(false)
  })
})

describe("resolveAssignableOrganizationRoles", () => {
  it("returns built-in roles for owners who can invite", () => {
    expect(
      resolveAssignableOrganizationRoles({
        canAssignRoles: true,
        activeMemberRole: "owner",
        dynamicRoles: [],
      })
    ).toEqual(["owner", "admin", "member"])
  })

  it("does not require dynamic roles from list-roles", () => {
    expect(
      resolveAssignableOrganizationRoles({
        canAssignRoles: true,
        activeMemberRole: "owner",
        dynamicRoles: undefined,
      })
    ).toEqual(["owner", "admin", "member"])
  })

  it("returns no roles when the user cannot assign", () => {
    expect(
      resolveAssignableOrganizationRoles({
        canAssignRoles: false,
        activeMemberRole: "owner",
      })
    ).toEqual([])
  })

  it("prevents non-owners from assigning the owner role", () => {
    expect(
      resolveAssignableOrganizationRoles({
        canAssignRoles: true,
        activeMemberRole: "admin",
      })
    ).toEqual(["admin", "member"])
  })

  it("merges custom dynamic roles", () => {
    expect(
      resolveAssignableOrganizationRoles({
        canAssignRoles: true,
        activeMemberRole: "owner",
        dynamicRoles: [{ role: "moderator" }],
      })
    ).toEqual(["owner", "admin", "member", "moderator"])
  })
})

describe("role formatting helpers", () => {
  it("parses and formats comma-separated roles", () => {
    expect(parseOrganizationRoles("owner,admin")).toEqual(["owner", "admin"])
    expect(formatOrganizationRoleLabel("owner,admin")).toBe("Owner, Admin")
  })
})
