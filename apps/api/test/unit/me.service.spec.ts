import { findOrganizationMemberRole } from "@workspace/auth/nestjs"
import type { JwtClaims } from "@workspace/auth/types"
import { MeService } from "../../src/modules/me/me.service"

jest.mock("@workspace/auth/nestjs", () => ({
  findOrganizationMemberRole: jest.fn(),
}))

const findOrganizationMemberRoleMock = jest.mocked(findOrganizationMemberRole)

describe("MeService", () => {
  const service = new MeService()

  const claims = {
    id: "user-1",
    email: "user@example.com",
    role: "user",
    name: "User",
    activeOrganizationId: "org-1",
    organizationRole: "member",
  } satisfies JwtClaims

  beforeEach(() => {
    findOrganizationMemberRoleMock.mockReset()
  })

  it("returns JWT claims with organization role resolved from the database", async () => {
    findOrganizationMemberRoleMock.mockResolvedValue("admin")

    await expect(service.getCurrentUser(claims)).resolves.toEqual({
      id: "user-1",
      email: "user@example.com",
      role: "user",
      name: "User",
      activeOrganizationId: "org-1",
      organizationRole: "admin",
    })

    expect(findOrganizationMemberRoleMock).toHaveBeenCalledWith(
      "org-1",
      "user-1"
    )
  })

  it("omits organization role lookup when no active workspace is set", async () => {
    await expect(
      service.getCurrentUser({ ...claims, activeOrganizationId: null })
    ).resolves.toEqual({
      id: "user-1",
      email: "user@example.com",
      role: "user",
      name: "User",
      activeOrganizationId: null,
      organizationRole: null,
    })

    expect(findOrganizationMemberRoleMock).not.toHaveBeenCalled()
  })
})
