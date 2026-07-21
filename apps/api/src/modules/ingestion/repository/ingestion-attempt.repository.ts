import { Types } from "mongoose"
import { IngestionJobModel, type IngestionStep } from "@workspace/db"

export type LogAttemptInput = {
  readonly contentId: string
  readonly userId: string
  readonly attemptNumber: number
  readonly step: IngestionStep
  readonly outcome: "SUCCESS" | "FAILED"
  readonly durationMs?: number
  readonly errorMessage?: string
}

export async function logIngestionAttempt(
  input: LogAttemptInput
): Promise<void> {
  await IngestionJobModel.create({
    contentId: new Types.ObjectId(input.contentId),
    userId: input.userId,
    attemptNumber: input.attemptNumber,
    step: input.step,
    outcome: input.outcome,
    durationMs: input.durationMs,
    errorMessage: input.errorMessage,
  })
}
