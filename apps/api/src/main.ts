import { NestFactory } from "@nestjs/core"
import { env } from "@workspace/config"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  })

  app.enableCors({
    origin: env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()),
    credentials: true,
  })

  await app.listen(env.PORT)
}
bootstrap()
