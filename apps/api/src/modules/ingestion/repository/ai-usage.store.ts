import { Injectable } from "@nestjs/common"
import { ApiUsageModel, type AiUsageProvider } from "@workspace/db"
import type {
  AiProviderKind,
  AiUsageIncrementInput,
  AiUsageSnapshot,
  AiUsageStore,
} from "@workspace/ai"

function utcDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

@Injectable()
export class MongoAiUsageStore implements AiUsageStore {
  async incrementDaily(input: AiUsageIncrementInput): Promise<AiUsageSnapshot> {
    const provider = toDbProvider(input.provider)
    const date = utcDateKey()
    const doc = await ApiUsageModel.findOneAndUpdate(
      { date, provider },
      {
        $inc: {
          requestCount: Number.isFinite(input.requests) ? input.requests : 0,
          tokenCount: Number.isFinite(input.tokens) ? input.tokens : 0,
        },
        $setOnInsert: { quotaExceededCount: 0 },
      },
      { upsert: true, returnDocument: "after" }
    )
    return {
      requestCount: doc?.requestCount ?? 0,
      tokenCount: doc?.tokenCount ?? 0,
    }
  }

  async recordQuotaExceeded(provider: AiProviderKind): Promise<void> {
    const date = utcDateKey()
    await ApiUsageModel.updateOne(
      { date, provider: toDbProvider(provider) },
      { $inc: { quotaExceededCount: 1 } },
      { upsert: true }
    )
  }
}

function toDbProvider(provider: AiProviderKind): AiUsageProvider {
  return provider
}
