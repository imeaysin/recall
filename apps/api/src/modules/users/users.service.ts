import { Injectable } from "@nestjs/common"
import { type UserSession } from "@workspace/auth/nestjs"
import { MeResponseSchema, type MeResponse } from "@workspace/contracts"

const DEFAULT_PLATFORM_ROLE = "user" as const

type CurrentUserContextInput = {
  readonly session: UserSession
}

@Injectable()
export class UsersService {
  async getCurrentUserContext(
    input: CurrentUserContextInput
  ): Promise<MeResponse> {
    const { session } = input

    return MeResponseSchema.parse({
      id: session.user.id,
      email: session.user.email,
      role: resolvePlatformRole(session.user.role),
      name: session.user.name,
    })
  }
}

function resolvePlatformRole(
  roleValue: string | string[] | null | undefined
): string {
  if (Array.isArray(roleValue)) {
    return roleValue[0] ?? DEFAULT_PLATFORM_ROLE
  }
  return roleValue ?? DEFAULT_PLATFORM_ROLE
}
