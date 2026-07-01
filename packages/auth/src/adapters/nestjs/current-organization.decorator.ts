import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common"
import type { JwtClaims } from "../../types/auth"

/** Active workspace id from the verified JWT (`session.activeOrganizationId`). */
export const CurrentOrganization = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtClaims }>()
    const organizationId = request.user?.activeOrganizationId

    if (!organizationId) {
      throw new ForbiddenException("No active organization")
    }

    return organizationId
  }
)
