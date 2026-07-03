import "./jose"

jest.mock("@workspace/auth/nestjs", () => {
  class JwksGuard {}
  class RbacGuard {}
  class OrgRbacGuard {}
  class AuthGuardsModule {}

  return {
    Public: () => () => undefined,
    CurrentUser: () => () => undefined,
    CurrentOrganization: () => () => undefined,
    RequirePermission: () => () => undefined,
    RequireOrgPermission: () => () => undefined,
    JwksGuard,
    RbacGuard,
    OrgRbacGuard,
    AuthGuardsModule: {
      register: () => ({
        module: AuthGuardsModule,
        providers: [],
      }),
    },
  }
})
