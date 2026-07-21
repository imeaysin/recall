import type { Message } from "@workspace/ui/components/ai/chat-message"
import { ChatMessageRole } from "@/features/chat/constants"

export function isWaitingOnReply(config: {
  readonly sendPending: boolean
  readonly messages: readonly Message[]
  readonly sendError: string | null
}): boolean {
  if (config.sendPending) return true
  if (config.sendError) return false
  const last = config.messages.at(-1)
  return last?.role === ChatMessageRole.User
}

export function shouldShowSuggestions(config: {
  readonly messages: readonly Message[]
  readonly sendPending: boolean
  readonly displayInflight: string | null
  readonly seedMessage: string | undefined
  readonly isLoading: boolean
}): boolean {
  if (config.isLoading) return false
  if (config.sendPending) return false
  if (config.displayInflight) return false
  if (config.seedMessage) return false
  return config.messages.length === 0
}
