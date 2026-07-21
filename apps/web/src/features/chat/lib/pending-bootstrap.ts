const pendingBootstrapByChat = new Map<string, string>()
const bootstrapStartedByChat = new Set<string>()

export function takeBootstrapMessage(config: {
  readonly chatId: string
  readonly pendingFromLocation: string | undefined
}): string | undefined {
  const { chatId, pendingFromLocation } = config
  if (pendingFromLocation) {
    pendingBootstrapByChat.set(chatId, pendingFromLocation)
    return pendingFromLocation
  }
  return pendingBootstrapByChat.get(chatId)
}

export function markBootstrapStarted(chatId: string): boolean {
  if (bootstrapStartedByChat.has(chatId)) return false
  bootstrapStartedByChat.add(chatId)
  return true
}

export function clearBootstrapMessage(chatId: string): void {
  pendingBootstrapByChat.delete(chatId)
  bootstrapStartedByChat.delete(chatId)
}

export function isBootstrapStarted(chatId: string): boolean {
  return bootstrapStartedByChat.has(chatId)
}
