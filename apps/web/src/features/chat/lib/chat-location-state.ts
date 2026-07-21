import { z } from "zod"

const ChatLocationStateSchema = z
  .object({
    pendingMessage: z.string().trim().min(1).optional(),
  })
  .strict()

export interface ChatLocationState {
  readonly pendingMessage?: string
}

export function createChatLocationState(
  pendingMessage: string
): ChatLocationState {
  return { pendingMessage }
}

export function parsePendingMessage(
  locationState: object | null
): string | undefined {
  const parsed = ChatLocationStateSchema.safeParse(locationState)
  if (!parsed.success) return undefined
  return parsed.data.pendingMessage
}
