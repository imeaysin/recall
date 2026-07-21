import { extractContent } from "@workspace/extractors"
import type { ContentEntity } from "@/modules/content/domain"
import { runExtractStep } from "./extract.step"
import { runMetadataStep } from "./metadata.step"
import { runGraphStep } from "./graph.step"
import { runEmbedStep } from "./embed.step"
import type { ProcessStepsDeps } from "./types"

export async function runIngestionSteps(
  deps: ProcessStepsDeps,
  claimed: ContentEntity
): Promise<void> {
  const resume = claimed.processingStep ?? "EXTRACT"

  if (resume === "EMBED" && claimed.topicRefs.length > 0) {
    const extracted = await extractContent({
      sourceType: claimed.sourceType,
      url: claimed.sourceUrl,
    })
    await runEmbedStep(deps, {
      claimed,
      extractedText: extracted.text,
      topics: [],
    })
    return
  }

  const afterExtract = await runExtractStep(deps, claimed)
  const afterMetadata = await runMetadataStep(deps, afterExtract)
  await runGraphStep(deps, afterMetadata)
  await runEmbedStep(deps, afterMetadata)
}

export type { ProcessStepsDeps } from "./types"
