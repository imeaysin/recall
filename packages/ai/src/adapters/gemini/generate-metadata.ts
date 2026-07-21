import { generateObject } from "ai"
import { assertWithinDailyQuota } from "../../quota-gate"
import { contentMetadataSchema } from "./metadata.schema"
import {
  AI_PROVIDER,
  AiProviderError,
  METADATA_TEXT_CHAR_LIMIT,
  type ContentMetadata,
} from "../../types"
import type { GeminiRuntime } from "./runtime"
import { rethrowAiFailure } from "../../errors"

export async function generateMetadata(
  runtime: GeminiRuntime,
  text: string
): Promise<ContentMetadata> {
  await assertWithinDailyQuota({
    store: runtime.usageStore,
    provider: AI_PROVIDER.GEMINI_FLASH,
    dailyCap: runtime.flashDailyCap,
  })

  try {
    const { object } = await generateObject({
      model: runtime.google(runtime.flashModel),
      schema: contentMetadataSchema,
      prompt: buildMetadataPrompt(text),
    })
    const parsed = contentMetadataSchema.parse(object)
    return {
      title: parsed.title.trim(),
      summary: parsed.summary.trim(),
      topics: parsed.topics.map((topic) => topic.trim()).filter(Boolean),
    }
  } catch (error) {
    if (!(error instanceof Error)) {
      throw new AiProviderError("Metadata generation failed")
    }
    rethrowAiFailure(error, "Metadata generation failed")
  }
}

function buildMetadataPrompt(text: string): string {
  const clipped = text.slice(0, METADATA_TEXT_CHAR_LIMIT)
  return `Extract a clean title, concise summary, and 0-5 categorical topics from this content. Do not invent topics if fewer than 3 are genuine.\n\nCONTENT:\n${clipped}`
}
