import { Module } from "@nestjs/common"
import { ContentModule } from "../content/content.module"
import { TopicsModule } from "../topics/topics.module"
import { IngestionService } from "./ingestion.service"
import { MongoAiUsageStore } from "./repository"
import { ContentIngestionListener } from "./listeners"

@Module({
  imports: [ContentModule, TopicsModule],
  providers: [MongoAiUsageStore, IngestionService, ContentIngestionListener],
  exports: [MongoAiUsageStore],
})
export class IngestionModule {}
