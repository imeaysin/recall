import { useEffect } from "react"
import type { NavigateFunction } from "react-router-dom"
import type { ChatMessageResponse } from "@workspace/contracts"
import { parsePendingMessage } from "@/features/chat/lib/chat-location-state"
import { hasServerUserText } from "@/features/chat/lib/chat-message-mapper"
import { bootstrapSeedMessage } from "@/features/chat/lib/chat-send-actions"
import { clearBootstrapMessage } from "@/features/chat/lib/pending-bootstrap"
import type { useStreamChatMessage } from "@/features/chat/hooks/use-stream-chat-message"

interface ChatDetailEffectsConfig {
  readonly chatId: string
  readonly seedMessage: string | undefined
  readonly inflightText: string | null
  readonly locationObject: object | null
  readonly pathname: string
  readonly navigate: NavigateFunction
  readonly locationClearedRef: { current: boolean }
  readonly isLoading: boolean
  readonly serverItems: readonly ChatMessageResponse[]
  readonly send: ReturnType<typeof useStreamChatMessage>
  readonly setSendError: (value: string | null) => void
  readonly setStreamingAssistantText: (value: string | null) => void
  readonly setInflightText: (value: string | null) => void
}

export function useChatDetailEffects(config: ChatDetailEffectsConfig): void {
  const {
    chatId,
    seedMessage,
    inflightText,
    locationObject,
    pathname,
    navigate,
    locationClearedRef,
    isLoading,
    serverItems,
    send,
    setSendError,
    setStreamingAssistantText,
    setInflightText,
  } = config

  useEffect(() => {
    if (locationClearedRef.current) return
    if (!parsePendingMessage(locationObject)) return
    locationClearedRef.current = true
    navigate(pathname, { replace: true, state: null })
  }, [locationClearedRef, locationObject, pathname, navigate])

  useEffect(() => {
    if (!seedMessage) return
    bootstrapSeedMessage({
      chatId,
      seedMessage,
      isLoading,
      serverItems,
      send,
      setSendError,
      setStreamingAssistantText,
      setInflightText,
    })
  }, [
    chatId,
    seedMessage,
    isLoading,
    serverItems,
    send,
    setSendError,
    setStreamingAssistantText,
    setInflightText,
  ])

  useEffect(() => {
    if (!inflightText) return
    if (!hasServerUserText({ items: serverItems, text: inflightText })) return
    clearBootstrapMessage(chatId)
  }, [chatId, inflightText, serverItems])

  useEffect(() => {
    const last = serverItems.at(-1)
    if (!last || last.role !== "assistant") return
    setStreamingAssistantText(null)
  }, [serverItems, setStreamingAssistantText])
}
