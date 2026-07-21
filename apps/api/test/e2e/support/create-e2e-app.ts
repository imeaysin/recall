import { type INestApplication } from "@nestjs/common"
import { Test, type TestingModule } from "@nestjs/testing"
import { AppModule } from "@/app.module"
import { configureApp } from "@/common/configure-app"

export async function createE2eApp(): Promise<{
  app: INestApplication
  moduleFixture: TestingModule
}> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  const app = moduleFixture.createNestApplication({ bodyParser: true })
  app.enableShutdownHooks()
  configureApp(app)
  await app.init()

  return { app, moduleFixture }
}
