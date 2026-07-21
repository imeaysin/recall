import { Module } from "@nestjs/common"
import { NestBetterAuthModule } from "./auth.module"

@Module({
  imports: [NestBetterAuthModule],
  exports: [NestBetterAuthModule],
})
export class WorkspaceAuthModule {}

export {
  AllowAnonymous,
  OptionalAuth,
  Session,
  Roles as RequireRoles,
  UserHasPermission,
  AuthService,
  AuthGuard,
  type UserSession,
} from "@thallesp/nestjs-better-auth"

export { Roles } from "../../access"
export { createAuth, type Auth } from "../auth"
