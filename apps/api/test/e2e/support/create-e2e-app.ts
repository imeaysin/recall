import { type INestApplication } from "@nestjs/common"
import { Test, type TestingModule } from "@nestjs/testing"
import { AppModule } from "../../../src/app.module"
import { configureApp } from "../../../src/common/configure-app"

export async function createE2eApp(): Promise<{
  app: INestApplication
  moduleFixture: TestingModule
}> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  const app = moduleFixture.createNestApplication({ bodyParser: false })
  configureApp(app)
  await app.init()

  return { app, moduleFixture }
}
