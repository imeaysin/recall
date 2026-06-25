import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { jwtVerify, createRemoteJWKSet } from "jose"
import { env } from "@workspace/config"
import { IS_PUBLIC_KEY } from "./public.decorator"

const JWKS = createRemoteJWKSet(
  new URL(`${env.BETTER_AUTH_URL}/api/auth/jwks`),
  { cooldownDuration: 300_000 }
)

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
      const { payload } = await jwtVerify(token, JWKS, {
        issuer: env.BETTER_AUTH_URL,
        audience: env.BETTER_AUTH_URL,
      })
      req.user = payload
      return true
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        err.code === "ERR_JWT_EXPIRED"
      ) {
        throw new UnauthorizedException("Token expired")
      }
      throw new UnauthorizedException("Invalid token")
    }
  }
}
