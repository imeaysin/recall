import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from "@nestjs/common"
import type { JwtClaims } from "@workspace/auth/types"

export const E2E_USER: JwtClaims = {
  id: "e2e-user",
  email: "e2e@example.com",
  role: "user",
  name: "E2E User",
  activeOrganizationId: "e2e-org",
  organizationRole: "owner",
}

/** Allows all requests — used as an e2e override for global auth guards. */
@Injectable()
export class PermissiveGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: JwtClaims }>()
    request.user = E2E_USER
    return true
  }
}
