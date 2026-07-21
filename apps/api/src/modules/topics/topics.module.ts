import { Module } from "@nestjs/common"
import { TopicsController } from "./topics.controller"
import { TopicsService } from "./topics.service"
import {
  TopicCommandRepository,
  TopicContentRepository,
  TopicIngestionRepository,
  TopicQueryRepository,
  TopicRootRepository,
} from "./repository"

@Module({
  controllers: [TopicsController],
  providers: [
    TopicQueryRepository,
    TopicCommandRepository,
    TopicContentRepository,
    TopicRootRepository,
    TopicIngestionRepository,
    TopicsService,
  ],
  exports: [
    TopicRootRepository,
    TopicIngestionRepository,
    TopicQueryRepository,
    TopicCommandRepository,
  ],
})
export class TopicsModule {}
