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

const chatKeys = {
  all: ["chats"] as const,
  list: ["chats", "list"] as const,
  messages: (chatId: string, params?: string) =>
    ["chats", "messages", chatId, params ?? ""] as const,
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
  const params = qs ? `?${qs}` : ""

  return useQuery({
    queryKey: chatKeys.messages(chatId ?? "", params),
    enabled: Boolean(chatId),
    queryFn: () =>
      apiFetch<ChatMessagesResponse>(
        `${apiRoutes.chatMessages(chatId!)}${params}`
      ),
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
    mutationFn: ({ id, body }: { id: string; body: UpdateChat }) =>
      apiFetch<ChatResponse>(apiRoutes.chatItem(id), {
        method: "PATCH",
        body: JSON.stringify(body),
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
        queryKey: chatKeys.messages(chatId),
      })
    },
  })
}
