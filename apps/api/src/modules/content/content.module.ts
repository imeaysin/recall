import { Module } from "@nestjs/common"
import { ContentController } from "./content.controller"
import { ContentService } from "./content.service"
import {
  ContentCommandRepository,
  ContentLifecycleRepository,
  ContentProcessingRepository,
  ContentQueryRepository,
  ContentTempFileStore,
  UserIngestionQuotaRepository,
} from "./repository"
import { UserDeletedListener, ContentMaintenanceListener } from "./listeners"
import { AuthLifecycleBridge } from "./listeners/auth-lifecycle.bridge"

@Module({
  controllers: [ContentController],
  providers: [
    ContentQueryRepository,
    ContentCommandRepository,
    ContentProcessingRepository,
    ContentLifecycleRepository,
    ContentTempFileStore,
    UserIngestionQuotaRepository,
    ContentService,
    UserDeletedListener,
    ContentMaintenanceListener,
    AuthLifecycleBridge,
  ],
  exports: [
    ContentQueryRepository,
    ContentCommandRepository,
    ContentProcessingRepository,
    ContentTempFileStore,
    ContentService,
  ],
})
export class ContentModule {}
