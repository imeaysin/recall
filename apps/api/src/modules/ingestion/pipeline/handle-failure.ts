import { ingestionEnv } from "@workspace/config/ingestion"
import { AiProviderError, AiQuotaExceededError } from "@workspace/ai"
import type {
  ContentErrorCode,
  ContentProcessingStep,
  ContentStatus,
} from "@workspace/db"
import type { ContentCommandRepository } from "@/modules/content/repository"
import {
  ContentDeletedDuringIngestionError,
  isExtractionErrorCode,
} from "../domain"
import { logIngestionAttempt } from "../repository"

export type HandleFailureInput = {
  readonly commandRepo: ContentCommandRepository
  readonly userId: string
  readonly contentId: string
  readonly retryCount: number
  readonly failedStep: ContentProcessingStep | "EXTRACT"
  readonly error: Error
}

type MappedFailure = {
  readonly errorCode: ContentErrorCode
  readonly message: string
}

type ErrorWithCode = Error & {
  readonly code: string
}

function hasErrorCode(error: Error): error is ErrorWithCode {
  return "code" in error && typeof error.code === "string"
}

export async function handleIngestionFailure(
  input: HandleFailureInput
): Promise<void> {
  if (input.error instanceof ContentDeletedDuringIngestionError) {
    return
  }

  if (input.error instanceof AiQuotaExceededError) {
    await input.commandRepo.updateIfActive(input.contentId, {
      status: "DEFERRED",
      errorCode: "AI_QUOTA_EXCEEDED",
      errorMessage: input.error.message,
      lockedAt: null,
      lockedBy: null,
    })
    return
  }

  const mapped = mapFailure(input.error)
  const nextRetry = input.retryCount + 1
  const terminal = nextRetry >= ingestionEnv.INGESTION_MAX_RETRIES
  const status: ContentStatus = terminal ? "FAILED" : "PENDING"

  await input.commandRepo.updateIfActive(input.contentId, {
    status,
    retryCount: nextRetry,
    errorCode: mapped.errorCode,
    errorMessage: mapped.message,
    lockedAt: null,
    lockedBy: null,
  })

  await logIngestionAttempt({
    contentId: input.contentId,
    userId: input.userId,
    step: toIngestionStep(input.failedStep),
    outcome: "FAILED",
    attemptNumber: nextRetry,
    errorMessage: mapped.message,
  })
}

function toIngestionStep(
  step: ContentProcessingStep | "EXTRACT"
): "EXTRACT" | "METADATA" | "GRAPH" | "EMBED" {
  if (step === "EMBED") return "EMBED"
  if (step === "GRAPH") return "GRAPH"
  if (step === "METADATA") return "METADATA"
  return "EXTRACT"
}

function mapFailure(error: Error): MappedFailure {
  if (hasErrorCode(error) && isExtractionErrorCode(error.code)) {
    return { errorCode: error.code, message: error.message }
  }

  if (error instanceof AiProviderError) {
    return { errorCode: "AI_ERROR", message: error.message }
  }

  return { errorCode: "AI_ERROR", message: error.message }
}
