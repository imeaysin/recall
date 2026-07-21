import { Types } from "mongoose"
import {
  extractContent,
  ExtractionError,
  sha256Hex,
} from "@workspace/extractors"
import type { ContentEntity } from "@/modules/content/domain"
import { ContentDeletedDuringIngestionError } from "../domain"
import { logIngestionAttempt } from "../repository"
import {
  assertStillActive,
  type PipelineState,
  type ProcessStepsDeps,
} from "./types"

export async function runExtractStep(
  deps: ProcessStepsDeps,
  claimed: ContentEntity
): Promise<PipelineState> {
  const started = Date.now()
  const extracted = await extractForClaimed(deps, claimed)
  const contentHash = sha256Hex(extracted.text)
  const duplicate = await deps.queryRepo.findDuplicateByHash({
    userId: claimed.userId,
    contentId: claimed.id,
    contentHash,
  })

  const updated = await deps.commandRepo.updateIfActive(claimed.id, {
    status: "METADATA",
    processingStep: "METADATA",
    wordCount: extracted.wordCount,
    contentHash,
    possibleDuplicateOfContentId: duplicate
      ? new Types.ObjectId(duplicate.id)
      : undefined,
    title: claimed.titleEditedByUser ? undefined : extracted.titleHint,
    language: extracted.language,
  })

  await logIngestionAttempt({
    contentId: claimed.id,
    userId: claimed.userId,
    step: "EXTRACT",
    outcome: "SUCCESS",
    durationMs: Date.now() - started,
    attemptNumber: claimed.retryCount + 1,
  })

  if (!updated) {
    throw new ContentDeletedDuringIngestionError(claimed.id)
  }
  assertStillActive(updated, "EXTRACT")

  return {
    claimed,
    extractedText: extracted.text,
    topics: [],
  }
}

async function extractForClaimed(
  deps: ProcessStepsDeps,
  claimed: ContentEntity
) {
  if (claimed.sourceType === "PDF") {
    const buffer = await deps.tempFileStore.takePdf(claimed.id)
    if (!buffer) {
      throw new ExtractionError(
        "EXTRACTION_FAILED",
        "PDF upload buffer is no longer available — retry the upload"
      )
    }
    try {
      return await extractContent({
        sourceType: "PDF",
        buffer,
        mimeType: "application/pdf",
      })
    } finally {
      await deps.tempFileStore.discard(claimed.id)
    }
  }

  return extractContent({
    sourceType: claimed.sourceType,
    url: claimed.sourceUrl,
  })
}
