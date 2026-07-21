import { Module } from "@nestjs/common"
import { ContentController } from "./content.controller"
import { ContentService } from "./content.service"
import {
  ContentCommandRepository,
  ContentLifecycleRepository,
  ContentProcessingRepository,
  ContentQueryRepository,
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
    ContentService,
  ],
})
export class ContentModule {}
