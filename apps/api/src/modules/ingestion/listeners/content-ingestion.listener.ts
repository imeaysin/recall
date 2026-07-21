import { Injectable } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { AppEvents } from "@/common/events"
import { ContentIngestionRequestedEvent } from "@/modules/content/events"
import { IngestionService } from "../ingestion.service"

@Injectable()
export class ContentIngestionListener {
  constructor(private readonly ingestionService: IngestionService) {}

  @OnEvent(AppEvents.CONTENT_INGESTION_REQUESTED, { async: true })
  async onIngestionRequested(
    event: ContentIngestionRequestedEvent
  ): Promise<void> {
    await this.ingestionService.processContent(event.contentId)
  }
}
