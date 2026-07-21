import type { AiProviderKind, AiUsageStore } from "./types"
import { AiQuotaExceededError } from "./types"

export type QuotaGateInput = {
  readonly store: AiUsageStore
  readonly provider: AiProviderKind
  readonly dailyCap: number
}

export async function assertWithinDailyQuota(
  input: QuotaGateInput
): Promise<void> {
  const snapshot = await input.store.incrementDaily({
    provider: input.provider,
    requests: 1,
  })

  if (snapshot.requestCount <= input.dailyCap) return

  await input.store.recordQuotaExceeded(input.provider)
  throw new AiQuotaExceededError(
    `${input.provider} daily request cap (${input.dailyCap}) exceeded`
  )
}
