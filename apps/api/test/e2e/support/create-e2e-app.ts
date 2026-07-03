import { type CanActivate, type INestApplication } from "@nestjs/common"
import { type ExecutionContext } from "@nestjs/common"
import { Test, type TestingModule } from "@nestjs/testing"
import type { JwtClaims } from "@workspace/auth/types"
import { JwksGuard, OrgRbacGuard, RbacGuard } from "@workspace/auth/nestjs"
import { AppModule } from "../../../src/app.module"
import { configureApp } from "../../../src/common/configure-app"
import { E2E_USER, PermissiveGuard } from "./permissive.guard"

const AUTH_GUARDS = [JwksGuard, RbacGuard, OrgRbacGuard] as const

export async function createE2eApp(): Promise<{
  app: INestApplication
  moduleFixture: TestingModule
}> {
  let moduleBuilder = Test.createTestingModule({
    imports: [AppModule],
  })

  for (const guard of AUTH_GUARDS) {
    moduleBuilder = moduleBuilder.overrideGuard(guard).useClass(PermissiveGuard)
  }

  const moduleFixture = await moduleBuilder.compile()
  const app = moduleFixture.createNestApplication({ bodyParser: false })
  configureApp(app)
  await app.init()

  return { app, moduleFixture }
}
