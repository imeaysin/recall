import { useMemo } from "react"
import { buildChatDetailApi } from "@/features/chat/lib/build-chat-detail-api"
import { useChatDetailEffects } from "@/features/chat/hooks/use-chat-detail-effects"
import {
  useChatDetailLocalState,
  useChatDetailResources,
  useDerivedChatMessages,
} from "@/features/chat/hooks/use-chat-detail-state"

export function useChatDetail(chatId: string) {
  const resources = useChatDetailResources(chatId)
  const local = useChatDetailLocalState(chatId)
  const serverItems = useMemo(
    () => resources.messagesQuery.data?.items ?? [],
    [resources.messagesQuery.data?.items]
  )
  const derived = useDerivedChatMessages({
    chatId,
    serverItems,
    inflightText: local.inflightText,
    streamingAssistantText: local.streamingAssistantText,
  })
  const chat = resources.chats.data?.items.find((entry) => entry.id === chatId)

  useChatDetailEffects({
    chatId,
    seedMessage: local.seedMessage,
    inflightText: local.inflightText,
    locationObject: local.locationObject,
    pathname: resources.location.pathname,
    navigate: resources.navigate,
    locationClearedRef: local.locationClearedRef,
    isLoading: resources.messagesQuery.isLoading,
    serverItems,
    send: resources.send,
    setSendError: local.setSendError,
    setStreamingAssistantText: local.setStreamingAssistantText,
    setInflightText: local.setInflightText,
  })

  return buildChatDetailApi({
    chat,
    messages: derived.messages,
    input: local.input,
    setInput: local.setInput,
    renaming: local.renaming,
    setRenaming: local.setRenaming,
    renameTitle: local.renameTitle,
    setRenameTitle: local.setRenameTitle,
    sendError: local.sendError,
    setSendError: local.setSendError,
    setInflightText: local.setInflightText,
    setStreamingAssistantText: local.setStreamingAssistantText,
    displayInflight: derived.displayInflight,
    seedMessage: local.seedMessage,
    messagesQuery: resources.messagesQuery,
    send: resources.send,
    update: resources.update,
    remove: resources.remove,
  })
}
