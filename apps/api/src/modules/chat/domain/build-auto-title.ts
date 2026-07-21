import { CHAT_AUTO_TITLE_MAX_LENGTH, DEFAULT_CHAT_TITLE } from "./constants"

export function resolveAutoTitle(input: {
  readonly currentTitle: string
  readonly firstUserQuestion: string
}): string | undefined {
  if (input.currentTitle !== DEFAULT_CHAT_TITLE) return undefined
  const trimmed = input.firstUserQuestion.trim()
  if (trimmed.length === 0) return undefined
  if (trimmed.length <= CHAT_AUTO_TITLE_MAX_LENGTH) return trimmed
  return `${trimmed.slice(0, CHAT_AUTO_TITLE_MAX_LENGTH).trimEnd()}…`
}
