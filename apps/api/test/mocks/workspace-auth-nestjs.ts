/// <reference types="jest" />

import type { DynamicModule } from "@nestjs/common"

const noopDecorator = () => () => undefined

export const Public = noopDecorator
export const CurrentUser = noopDecorator
export const CurrentOrganization = noopDecorator
export const RequirePermission = noopDecorator
export const RequireOrgPermission = noopDecorator

export const findOrganizationMemberRole = jest.fn()

export class JwksGuard {}
export class RbacGuard {}
export class OrgRbacGuard {}

export class AuthGuardsModule {
  static register(): DynamicModule {
    return {
      module: class AuthGuardsModuleStub {},
    }
  }
}
