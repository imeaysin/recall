import {
  createParamDecorator,
  Global,
  Injectable,
  Module,
  SetMetadata,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common"
import { APP_GUARD, Reflector } from "@nestjs/core"

const AUTH_METADATA = {
  PUBLIC: "PUBLIC",
  OPTIONAL: "OPTIONAL",
} satisfies {
  readonly PUBLIC: "PUBLIC"
  readonly OPTIONAL: "OPTIONAL"
}

type AuthMetadataKey = (typeof AUTH_METADATA)[keyof typeof AUTH_METADATA]

type RouteMetadataTargets = readonly [
  ReturnType<ExecutionContext["getHandler"]>,
  ReturnType<ExecutionContext["getClass"]>,
]

interface PermissionCheckOptions {
  readonly permissions?: Readonly<Record<string, readonly string[]>>
}

/** Header that unlocks authenticated e2e routes with a fixed test session. */
export const E2E_SESSION_HEADER = "x-e2e-session"
export const E2E_TEST_USER_ID = "e2e-test-user"

export const AllowAnonymous = () => SetMetadata(AUTH_METADATA.PUBLIC, true)
export const OptionalAuth = () => SetMetadata(AUTH_METADATA.OPTIONAL, true)
export const RequireRoles = (_roles?: readonly string[]) => () => undefined
export const UserHasPermission = (_options?: PermissionCheckOptions) => () =>
  undefined

export interface UserSession {
  readonly user: {
    readonly id: string
    readonly email: string
    readonly emailVerified: boolean
    readonly name: string
    readonly role?: string | string[] | null
    readonly createdAt: Date
    readonly updatedAt: Date
  }
  readonly session: {
    readonly id: string
    readonly userId: string
    readonly expiresAt: Date
    readonly token: string
    readonly createdAt: Date
    readonly updatedAt: Date
  }
}

function buildE2eSession(): UserSession {
  const now = new Date()
  return {
    user: {
      id: E2E_TEST_USER_ID,
      email: "e2e@example.com",
      emailVerified: true,
      name: "E2E User",
      role: "user",
      createdAt: now,
      updatedAt: now,
    },
    session: {
      id: "e2e-session",
      userId: E2E_TEST_USER_ID,
      expiresAt: new Date(now.getTime() + 86_400_000),
      token: "e2e-token",
      createdAt: now,
      updatedAt: now,
    },
  }
}

export const Session = createParamDecorator(
  (_data: undefined, _ctx: ExecutionContext): UserSession => buildE2eSession()
)

type RequestWithHeaders = {
  readonly headers: Readonly<Record<string, string | string[] | undefined>>
}

function headerValue(
  headers: RequestWithHeaders["headers"],
  name: string
): string | undefined {
  const value = headers[name]
  if (typeof value === "string") return value
  if (Array.isArray(value)) return value[0]
  return undefined
}

@Injectable()
class MockAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets: RouteMetadataTargets = [
      context.getHandler(),
      context.getClass(),
    ]

    if (this.hasMetadata(AUTH_METADATA.PUBLIC, targets)) {
      return true
    }

    if (this.hasMetadata(AUTH_METADATA.OPTIONAL, targets)) {
      return true
    }

    const request = context.switchToHttp().getRequest<RequestWithHeaders>()
    if (headerValue(request.headers, E2E_SESSION_HEADER) === "1") {
      return true
    }

    throw new UnauthorizedException()
  }

  private hasMetadata(
    key: AuthMetadataKey,
    targets: RouteMetadataTargets
  ): boolean {
    return this.reflector.getAllAndOverride<boolean>(key, [...targets]) === true
  }
}

interface AuthServiceApi {
  readonly getSession: () => Promise<null>
}

export class AuthService {
  readonly api: AuthServiceApi = {
    getSession: async () => null,
  }
}

@Global()
@Module({
  providers: [AuthService, { provide: APP_GUARD, useClass: MockAuthGuard }],
  exports: [AuthService],
})
export class WorkspaceAuthModule {}
