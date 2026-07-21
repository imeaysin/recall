import type { UserSession } from "@workspace/auth/nestjs"
import { UsersService } from "@/modules/users/users.service"

describe("UsersService", () => {
  const service = new UsersService()

  const session = {
    user: {
      id: "user-1",
      email: "user@example.com",
      emailVerified: true,
      name: "User",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    session: {
      id: "session-1",
      userId: "user-1",
      expiresAt: new Date(),
      token: "token",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  } satisfies UserSession

  it("returns session user context", async () => {
    await expect(service.getCurrentUserContext({ session })).resolves.toEqual({
      id: "user-1",
      email: "user@example.com",
      role: "user",
      name: "User",
    })
  })

  it("defaults missing role to user", async () => {
    await expect(
      service.getCurrentUserContext({
        session: {
          ...session,
          user: { ...session.user, role: undefined },
        },
      })
    ).resolves.toMatchObject({ role: "user" })
  })
})
