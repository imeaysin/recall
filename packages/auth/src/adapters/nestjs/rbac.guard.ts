import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { roles } from "../../permissions/platform"
import { PERMISSION_KEY } from "./require-permission.decorator"
import type { JWTClaims } from "../../types/auth.types"

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<{
      resource: string
      action: string
    }>(PERMISSION_KEY, [ctx.getHandler(), ctx.getClass()])
    if (!required) return true

    const req = ctx.switchToHttp().getRequest<{ user: JWTClaims }>()
    const roleName = `${req.user.role}Role` as keyof typeof roles
    const role = roles[roleName]
    if (!role) throw new ForbiddenException(`Unknown role: ${req.user.role}`)

    const result = role.authorize({
      [required.resource]: [required.action],
    })
    if (!result.success)
      throw new ForbiddenException("Insufficient permissions")

    return true
  }
}
