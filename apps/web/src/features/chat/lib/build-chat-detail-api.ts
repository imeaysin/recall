import type { Message } from "@workspace/ui/components/ai/chat-message"
import type { ChatResponse } from "@workspace/contracts"
import {
  isWaitingOnReply,
  shouldShowSuggestions,
} from "@/features/chat/lib/chat-detail-view-state"
import {
  retryChatSend,
  submitChatMessage,
} from "@/features/chat/lib/chat-send-actions"
import type {
  useChatMessages,
  useDeleteChat,
  useUpdateChat,
} from "@/features/chat/hooks/use-chat"
import type { useStreamChatMessage } from "@/features/chat/hooks/use-stream-chat-message"

interface BuildChatDetailApiConfig {
  readonly chat: ChatResponse | undefined
  readonly messages: readonly Message[]
  readonly input: string
  readonly setInput: (value: string) => void
  readonly renaming: boolean
  readonly setRenaming: (value: boolean) => void
  readonly renameTitle: string
  readonly setRenameTitle: (value: string) => void
  readonly sendError: string | null
  readonly setSendError: (value: string | null) => void
  readonly setInflightText: (value: string | null) => void
  readonly setStreamingAssistantText: (value: string | null) => void
  readonly displayInflight: string | null
  readonly seedMessage: string | undefined
  readonly messagesQuery: ReturnType<typeof useChatMessages>
  readonly send: ReturnType<typeof useStreamChatMessage>
  readonly update: ReturnType<typeof useUpdateChat>
  readonly remove: ReturnType<typeof useDeleteChat>
}

export function buildChatDetailApi(config: BuildChatDetailApiConfig) {
  return {
    chat: config.chat,
    messages: config.messages,
    input: config.input,
    setInput: config.setInput,
    renaming: config.renaming,
    setRenaming: config.setRenaming,
    renameTitle: config.renameTitle,
    setRenameTitle: config.setRenameTitle,
    sendError: config.sendError,
    displayInflight: config.displayInflight,
    messagesQuery: config.messagesQuery,
    send: config.send,
    update: config.update,
    remove: config.remove,
    actionPending: config.update.isPending || config.remove.isPending,
    waitingOnReply: isWaitingOnReply({
      sendPending: config.send.isPending,
      messages: config.messages,
      sendError: config.sendError,
    }),
    showSuggestions: shouldShowSuggestions({
      messages: config.messages,
      sendPending: config.send.isPending,
      displayInflight: config.displayInflight,
      seedMessage: config.seedMessage,
      isLoading: config.messagesQuery.isLoading,
    }),
    submitMessage: (text: string) =>
      submitChatMessage({
        text,
        send: config.send,
        setSendError: config.setSendError,
        setInflightText: config.setInflightText,
        setStreamingAssistantText: config.setStreamingAssistantText,
        setInput: config.setInput,
      }),
    retryFailedSend: () =>
      retryChatSend({
        inflightText: config.displayInflight,
        send: config.send,
        setSendError: config.setSendError,
        setStreamingAssistantText: config.setStreamingAssistantText,
        setInflightText: config.setInflightText,
      }),
  }
}
