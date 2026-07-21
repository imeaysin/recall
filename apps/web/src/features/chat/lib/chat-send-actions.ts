import type { ChatMessageResponse } from "@workspace/contracts"
import { CHAT_SEND_ERROR } from "@/features/chat/constants"
import {
  hasServerUserText,
  resolveErrorMessage,
} from "@/features/chat/lib/chat-message-mapper"
import {
  clearBootstrapMessage,
  isBootstrapStarted,
  markBootstrapStarted,
} from "@/features/chat/lib/pending-bootstrap"
import type { useStreamChatMessage } from "@/features/chat/hooks/use-stream-chat-message"

type StreamMutation = ReturnType<typeof useStreamChatMessage>

export function bootstrapSeedMessage(config: {
  readonly chatId: string
  readonly seedMessage: string
  readonly isLoading: boolean
  readonly serverItems: readonly ChatMessageResponse[]
  readonly send: StreamMutation
  readonly setSendError: (value: string | null) => void
  readonly setStreamingAssistantText: (value: string | null) => void
  readonly setInflightText: (value: string | null) => void
}): void {
  if (isBootstrapStarted(config.chatId)) return
  if (config.isLoading) return
  if (
    hasServerUserText({
      items: config.serverItems,
      text: config.seedMessage,
    })
  ) {
    clearBootstrapMessage(config.chatId)
    return
  }
  if (!markBootstrapStarted(config.chatId)) return
  runStreamSend({
    text: config.seedMessage,
    send: config.send,
    setSendError: config.setSendError,
    setStreamingAssistantText: config.setStreamingAssistantText,
    setInflightText: config.setInflightText,
    restoreInputOnError: false,
  })
}

export function submitChatMessage(config: {
  readonly text: string
  readonly send: StreamMutation
  readonly setSendError: (value: string | null) => void
  readonly setInflightText: (value: string | null) => void
  readonly setStreamingAssistantText: (value: string | null) => void
  readonly setInput: (value: string) => void
}): void {
  const trimmed = config.text.trim()
  if (!trimmed || config.send.isPending) return
  config.setSendError(null)
  config.setInflightText(trimmed)
  config.setStreamingAssistantText(null)
  config.setInput("")
  runStreamSend({
    text: trimmed,
    send: config.send,
    setSendError: config.setSendError,
    setStreamingAssistantText: config.setStreamingAssistantText,
    setInflightText: config.setInflightText,
    restoreInputOnError: true,
  })
}

export function retryChatSend(config: {
  readonly inflightText: string | null
  readonly send: StreamMutation
  readonly setSendError: (value: string | null) => void
  readonly setStreamingAssistantText: (value: string | null) => void
  readonly setInflightText: (value: string | null) => void
}): void {
  if (!config.inflightText || config.send.isPending) return
  config.setSendError(null)
  config.setStreamingAssistantText(null)
  runStreamSend({
    text: config.inflightText,
    send: config.send,
    setSendError: config.setSendError,
    setStreamingAssistantText: config.setStreamingAssistantText,
    setInflightText: config.setInflightText,
    restoreInputOnError: false,
  })
}

function runStreamSend(config: {
  readonly text: string
  readonly send: StreamMutation
  readonly setSendError: (value: string | null) => void
  readonly setStreamingAssistantText: (value: string | null) => void
  readonly setInflightText: (value: string | null) => void
  readonly restoreInputOnError: boolean
}): void {
  let assembled = ""
  config.send.mutate(
    {
      body: { text: config.text },
      onToken: (chunk) => {
        assembled += chunk
        config.setStreamingAssistantText(assembled)
      },
    },
    {
      onSuccess: () => {
        config.setInflightText(null)
      },
      onError: (error) => {
        config.setStreamingAssistantText(null)
        config.setSendError(
          resolveErrorMessage({ error, fallback: CHAT_SEND_ERROR })
        )
      },
    }
  )
}
