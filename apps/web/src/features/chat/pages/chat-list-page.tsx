import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Chat } from "@workspace/ui/components/ai/chat"
import { routes } from "@/config/routes"
import { PageShell } from "@/features/shell/components/page-shell"
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
    <PageShell className={CHAT_PAGE_SHELL_CLASS}>
      {error ? (
        <Alert variant="destructive" className="mx-auto w-full max-w-3xl">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Chat
        className="min-h-0 flex-1"
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
    </PageShell>
  )
}
