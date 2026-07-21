import { useMemo, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import type { ChatMessageResponse } from "@workspace/contracts"
import { CHAT_MESSAGES_PAGE_LIMIT } from "@/features/chat/constants"
import {
  hasServerUserText,
  mergeOptimisticMessages,
  toUiMessage,
} from "@/features/chat/lib/chat-message-mapper"
import { parsePendingMessage } from "@/features/chat/lib/chat-location-state"
import { takeBootstrapMessage } from "@/features/chat/lib/pending-bootstrap"
import {
  useChatList,
  useChatMessages,
  useDeleteChat,
  useUpdateChat,
} from "@/features/chat/hooks/use-chat"
import { useStreamChatMessage } from "@/features/chat/hooks/use-stream-chat-message"

export function useChatDetailResources(chatId: string) {
  const navigate = useNavigate()
  const location = useLocation()
  const chats = useChatList()
  const messagesQuery = useChatMessages(chatId, {
    limit: CHAT_MESSAGES_PAGE_LIMIT,
  })
  const send = useStreamChatMessage(chatId)
  const update = useUpdateChat()
  const remove = useDeleteChat()
  return { navigate, location, chats, messagesQuery, send, update, remove }
}

export function useChatDetailLocalState(chatId: string) {
  const location = useLocation()
  const locationClearedRef = useRef(false)
  const locationObject =
    location.state !== null && typeof location.state === "object"
      ? location.state
      : null
  const [seedMessage] = useState(() =>
    takeBootstrapMessage({
      chatId,
      pendingFromLocation: parsePendingMessage(locationObject),
    })
  )
  const [input, setInput] = useState("")
  const [renaming, setRenaming] = useState(false)
  const [renameTitle, setRenameTitle] = useState("")
  const [sendError, setSendError] = useState<string | null>(null)
  const [inflightText, setInflightText] = useState<string | null>(
    seedMessage ?? null
  )
  const [streamingAssistantText, setStreamingAssistantText] = useState<
    string | null
  >(null)
  return {
    locationClearedRef,
    locationObject,
    seedMessage,
    input,
    setInput,
    renaming,
    setRenaming,
    renameTitle,
    setRenameTitle,
    sendError,
    setSendError,
    inflightText,
    setInflightText,
    streamingAssistantText,
    setStreamingAssistantText,
  }
}

export function useDerivedChatMessages(config: {
  readonly chatId: string
  readonly serverItems: readonly ChatMessageResponse[]
  readonly inflightText: string | null
  readonly streamingAssistantText: string | null
}) {
  const serverMessages = useMemo(
    () => config.serverItems.map(toUiMessage),
    [config.serverItems]
  )
  const messages = useMemo(
    () =>
      mergeOptimisticMessages({
        chatId: config.chatId,
        serverItems: config.serverItems,
        serverMessages,
        inflightText: config.inflightText,
        streamingAssistantText: config.streamingAssistantText,
      }),
    [
      config.chatId,
      config.serverItems,
      serverMessages,
      config.inflightText,
      config.streamingAssistantText,
    ]
  )
  const displayInflight =
    config.inflightText !== null &&
    !hasServerUserText({
      items: config.serverItems,
      text: config.inflightText,
    })
      ? config.inflightText
      : null
  return { messages, displayInflight }
}
