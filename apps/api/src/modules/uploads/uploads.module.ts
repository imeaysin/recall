import { Module } from "@nestjs/common"
import { UploadCommandRepository } from "./repository/upload.command"
import { UploadsController } from "./uploads.controller"
import { UploadsService } from "./uploads.service"

@Module({
  controllers: [UploadsController],
  providers: [UploadCommandRepository, UploadsService],
})
export class UploadsModule {}
