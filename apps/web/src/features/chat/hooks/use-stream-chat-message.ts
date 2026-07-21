import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { SendChatMessage } from "@workspace/contracts"
import { CHAT_QUERY_MESSAGES, CHAT_QUERY_ROOT } from "@/features/chat/constants"
import { streamChatMessage } from "@/features/chat/lib/stream-chat-message"

export function useStreamChatMessage(chatId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (config: {
      readonly body: SendChatMessage
      readonly onToken: (chunk: string) => void
    }) =>
      streamChatMessage({
        chatId,
        body: config.body,
        onToken: config.onToken,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [CHAT_QUERY_ROOT] })
      void queryClient.invalidateQueries({
        queryKey: [CHAT_QUERY_ROOT, CHAT_QUERY_MESSAGES, chatId],
      })
    },
  })
}
