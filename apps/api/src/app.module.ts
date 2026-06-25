import { Module } from "@nestjs/common"
import { AuthModule } from "@thallesp/nestjs-better-auth"
import { createAuth } from "@workspace/auth"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { DatabaseModule, DATABASE_READY } from "./database/database.module"

@Module({
  imports: [
    DatabaseModule,
    AuthModule.forRootAsync({
      imports: [DatabaseModule],
      inject: [DATABASE_READY],
      useFactory: () => ({
        auth: createAuth(),
        bodyParser: {
          json: { limit: "2mb" },
          urlencoded: { limit: "2mb", extended: true },
          rawBody: true,
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
