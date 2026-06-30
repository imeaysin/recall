import { Logger } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { env } from "@workspace/config"
import { createLogger } from "@workspace/logger"
import { AppModule } from "./app.module"
import { configureApp } from "./common/configure-app"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  })

  const nestLogger = new Logger("Bootstrap")
  app.useLogger(nestLogger)

  configureApp(app)
  app.enableShutdownHooks()

  await app.listen(env.PORT)

  const logger = createLogger("Bootstrap")
  logger.info({ port: env.PORT }, "API listening")
  if (env.NODE_ENV !== "production") {
    logger.info({ path: "/docs" }, "Swagger docs available")
  }
}

bootstrap().catch((error: unknown) => {
  createLogger("Bootstrap").error(
    { err: error instanceof Error ? error : { message: String(error) } },
    "Failed to start API"
  )
  process.exit(1)
})
