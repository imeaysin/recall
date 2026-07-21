import { Injectable } from "@nestjs/common"
import {
  createGeminiAiClient,
  AiProviderError,
  type AiClient,
} from "@workspace/ai"
import { aiEnv } from "@workspace/config/ai"
import { MongoAiUsageStore } from "@/modules/ingestion/repository"

@Injectable()
export class ChatAiClientProvider {
  private client: AiClient | null = null

  constructor(private readonly usageStore: MongoAiUsageStore) {}

  getClient(): AiClient {
    if (this.client) return this.client
    if (!aiEnv.GEMINI_API_KEY) {
      throw new AiProviderError("GEMINI_API_KEY is not configured")
    }
    this.client = createGeminiAiClient({ usageStore: this.usageStore })
    return this.client
  }
}
