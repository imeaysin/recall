import { Module } from "@nestjs/common"
import { CqrsModule } from "@nestjs/cqrs"
import { UploadFileHandler } from "./commands/upload-file.handler"
import { StorageRepository } from "./repositories/storage.repository"
import { UploadsController } from "./uploads.controller"

@Module({
  imports: [CqrsModule],
  controllers: [UploadsController],
  providers: [StorageRepository, UploadFileHandler],
})
export class UploadsModule {}
