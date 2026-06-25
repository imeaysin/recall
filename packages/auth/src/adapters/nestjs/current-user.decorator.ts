import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import type { JWTClaims } from "../../types/auth.types"

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JWTClaims => {
    const request = ctx.switchToHttp().getRequest<{ user: JWTClaims }>()
    return request.user
  }
)
