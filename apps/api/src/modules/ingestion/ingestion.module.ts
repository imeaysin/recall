import { Module } from "@nestjs/common"
import { ContentModule } from "../content/content.module"
import { IngestionService } from "./ingestion.service"
import { MongoAiUsageStore } from "./repository"
import { ContentIngestionListener } from "./listeners"

@Module({
  imports: [ContentModule],
  providers: [MongoAiUsageStore, IngestionService, ContentIngestionListener],
})
export class IngestionModule {}
