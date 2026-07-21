import type { ChangeEvent } from "react"
import { Chat } from "@workspace/ui/components/ai/chat"
import type { Message } from "@workspace/ui/components/ai/chat-message"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  CHAT_INPUT_PLACEHOLDER,
  CHAT_PROMPT_SUGGESTIONS,
} from "@/features/chat/constants"

interface ChatConversationProps {
  readonly isLoading: boolean
  readonly showSuggestions: boolean
  readonly messages: readonly Message[]
  readonly input: string
  readonly isGenerating: boolean
  readonly onInputChange: (value: string) => void
  readonly onSubmit: () => void
  readonly onAppend: (content: string) => void
}

export function ChatConversation(props: ChatConversationProps) {
  if (props.isLoading && props.messages.length === 0) {
    return <ChatMessagesSkeleton />
  }

  const chatProps = {
    className: "size-full min-h-0",
    messages: [...props.messages],
    input: props.input,
    handleInputChange: (event: ChangeEvent<HTMLTextAreaElement>) =>
      props.onInputChange(event.target.value),
    isGenerating: props.isGenerating,
    handleSubmit: (event?: { preventDefault?: () => void }) => {
      event?.preventDefault?.()
      props.onSubmit()
    },
    placeholder: CHAT_INPUT_PLACEHOLDER,
  }

  if (props.showSuggestions) {
    return (
      <Chat
        {...chatProps}
        append={(message) => props.onAppend(message.content)}
        suggestions={[...CHAT_PROMPT_SUGGESTIONS]}
      />
    )
  }

  return <Chat {...chatProps} />
}

function ChatMessagesSkeleton() {
  return (
    <div className="mx-auto flex size-full w-full max-w-3xl flex-col gap-4 px-4 pt-16 md:px-6">
      <Skeleton className="h-20 w-4/5 rounded-2xl" />
      <Skeleton className="ml-auto h-12 w-2/5 rounded-2xl" />
      <Skeleton className="h-28 w-3/4 rounded-2xl" />
    </div>
  )
}
