import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type {
  ChatListResponse,
  ChatMessagesQuery,
  ChatMessagesResponse,
  ChatResponse,
  CreateChat,
  SendChatMessage,
  SendChatMessageResponse,
  UpdateChat,
} from "@workspace/contracts"
import { apiFetch } from "@/lib/api"
import { apiRoutes } from "@/config/api-routes"
import {
  CHAT_QUERY_LIST,
  CHAT_QUERY_MESSAGES,
  CHAT_QUERY_ROOT,
} from "@/features/chat/constants"

const chatKeys = {
  all: [CHAT_QUERY_ROOT],
  list: [CHAT_QUERY_ROOT, CHAT_QUERY_LIST],
  messages: (chatId: string, params = "") => [
    CHAT_QUERY_ROOT,
    CHAT_QUERY_MESSAGES,
    chatId,
    params,
  ],
}

export function useChatList() {
  return useQuery({
    queryKey: chatKeys.list,
    queryFn: () => apiFetch<ChatListResponse>(apiRoutes.chats),
  })
}

export function useChatMessages(
  chatId: string | undefined,
  query?: ChatMessagesQuery
) {
  const search = new URLSearchParams()
  if (query?.limit) search.set("limit", String(query.limit))
  if (query?.before) search.set("before", query.before)
  const qs = search.toString()
  const params = qs.length > 0 ? `?${qs}` : ""

  return useQuery({
    queryKey: chatKeys.messages(chatId ?? "", params),
    enabled: Boolean(chatId),
    queryFn: () => {
      if (!chatId) {
        throw new Error("chatId is required to load messages")
      }
      return apiFetch<ChatMessagesResponse>(
        `${apiRoutes.chatMessages(chatId)}${params}`
      )
    },
  })
}

export function useCreateChat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body?: CreateChat) =>
      apiFetch<ChatResponse>(apiRoutes.chats, {
        method: "POST",
        body: JSON.stringify(body ?? {}),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.all })
    },
  })
}

export function useUpdateChat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (config: { readonly id: string; readonly body: UpdateChat }) =>
      apiFetch<ChatResponse>(apiRoutes.chatItem(config.id), {
        method: "PATCH",
        body: JSON.stringify(config.body),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.all })
    },
  })
}

export function useDeleteChat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(apiRoutes.chatItem(id), { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.all })
    },
  })
}

export function useSendChatMessage(chatId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: SendChatMessage) =>
      apiFetch<SendChatMessageResponse>(apiRoutes.chatMessages(chatId), {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.all })
      void queryClient.invalidateQueries({
        queryKey: [CHAT_QUERY_ROOT, CHAT_QUERY_MESSAGES, chatId],
      })
    },
  })
}
