import { describe, expect, it } from "vitest"
import { checkPlatformPermission } from "@workspace/auth/permissions"

describe("platformUiPermissions", () => {
  it("allows admins to manage platform users", () => {
    expect(checkPlatformPermission("admin", "user", "list")).toBe(true)
    expect(checkPlatformPermission("admin", "user", "create")).toBe(true)
    expect(checkPlatformPermission("admin", "user", "set-role")).toBe(true)
    expect(checkPlatformPermission("admin", "user", "ban")).toBe(true)
    expect(checkPlatformPermission("admin", "user", "impersonate")).toBe(true)
  })

  it("hides admin actions from guest users", () => {
    expect(checkPlatformPermission("guest", "user", "list")).toBe(false)
    expect(checkPlatformPermission("guest", "user", "ban")).toBe(false)
  })
})
