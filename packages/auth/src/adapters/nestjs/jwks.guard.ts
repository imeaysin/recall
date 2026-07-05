import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { isJwtExpiredError, verifyAccessToken } from "../../lib/jwt"
import { IS_PUBLIC_KEY } from "./public.decorator"

@Injectable()
export class JwksGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ])
    if (isPublic) return true

    const req = ctx.switchToHttp().getRequest<{
      headers: { authorization?: string }
      user?: unknown
    }>()
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "")?.trim()
    if (!token) throw new UnauthorizedException("Missing bearer token")

    try {
      const claims = await verifyAccessToken(token)

      if (claims.banned) {
        throw new UnauthorizedException("User is banned")
      }

      if (!claims.emailVerified) {
        throw new UnauthorizedException("Email is not verified")
      }

      req.user = claims
      return true
    } catch (error: unknown) {
      if (isJwtExpiredError(error)) {
        throw new UnauthorizedException("Token expired")
      }
      throw new UnauthorizedException("Invalid token")
    }
  }
}
