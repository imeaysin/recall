import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Chat } from "@workspace/ui/components/ai/chat"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { routes } from "@/config/routes"
import {
  CHAT_CREATE_ERROR,
  CHAT_CREATE_TITLE_MAX_LENGTH,
  CHAT_INPUT_PLACEHOLDER,
  CHAT_PAGE_SHELL_CLASS,
  CHAT_PROMPT_SUGGESTIONS,
} from "@/features/chat/constants"
import { createChatLocationState } from "@/features/chat/lib/chat-location-state"
import { resolveErrorMessage } from "@/features/chat/lib/chat-message-mapper"
import { useCreateChat } from "@/features/chat/hooks/use-chat"

export function ChatListPage() {
  const create = useCreateChat()
  const navigate = useNavigate()
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)

  function startChat(text: string) {
    const trimmed = text.trim()
    if (!trimmed || create.isPending) return
    setError(null)
    create.mutate(
      { title: trimmed.slice(0, CHAT_CREATE_TITLE_MAX_LENGTH) },
      {
        onSuccess: (chat) => {
          setInput("")
          navigate(routes.chatDetail(chat.id), {
            state: createChatLocationState(trimmed),
          })
        },
        onError: (err) => {
          setError(
            resolveErrorMessage({ error: err, fallback: CHAT_CREATE_ERROR })
          )
        },
      }
    )
  }

  return (
    <div className={CHAT_PAGE_SHELL_CLASS}>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex p-3 md:p-4">
        <SidebarTrigger className="pointer-events-auto md:hidden" />
      </div>

      {error ? (
        <div className="absolute inset-x-0 top-12 z-20 px-4 pt-2 md:px-6">
          <Alert variant="destructive" className="mx-auto w-full max-w-4xl">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      ) : null}

      <Chat
        className="size-full min-h-0"
        messages={[]}
        input={input}
        handleInputChange={(event) => setInput(event.target.value)}
        isGenerating={create.isPending}
        handleSubmit={(event) => {
          event?.preventDefault?.()
          startChat(input)
        }}
        append={(message) => startChat(message.content)}
        suggestions={[...CHAT_PROMPT_SUGGESTIONS]}
        placeholder={CHAT_INPUT_PLACEHOLDER}
      />
    </div>
  )
}
