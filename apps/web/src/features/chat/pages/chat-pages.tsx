import { Link, useNavigate, useParams } from "react-router-dom"
import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { routes } from "@/config/routes"
import type { ChatCitation, ChatMessageResponse } from "@workspace/contracts"
import {
  useChatList,
  useChatMessages,
  useCreateChat,
  useDeleteChat,
  useSendChatMessage,
  useUpdateChat,
} from "../hooks/use-chat"

export function ChatListPage() {
  const chats = useChatList()
  const create = useCreateChat()
  const update = useUpdateChat()
  const remove = useDeleteChat()
  const navigate = useNavigate()

  const [renameId, setRenameId] = useState<string | null>(null)
  const [renameTitle, setRenameTitle] = useState("")

  const items = chats.data?.items ?? []

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chat</h1>
          <p className="text-sm text-muted-foreground">
            Ask questions over your library with citations.
          </p>
        </div>
        <Button
          disabled={create.isPending}
          onClick={() =>
            create.mutate(undefined, {
              onSuccess: (chat) => navigate(routes.chatDetail(chat.id)),
            })
          }
        >
          New chat
        </Button>
      </div>

      {chats.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border">
          {items.map((chat) => (
            <li
              key={chat.id}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              {renameId === chat.id ? (
                <div className="flex flex-1 gap-2">
                  <Input
                    value={renameTitle}
                    onChange={(event) => setRenameTitle(event.target.value)}
                    maxLength={120}
                  />
                  <Button
                    size="sm"
                    disabled={update.isPending}
                    onClick={() => {
                      const title = renameTitle.trim()
                      if (!title) return
                      update.mutate(
                        { id: chat.id, body: { title } },
                        { onSuccess: () => setRenameId(null) }
                      )
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRenameId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <Link
                      to={routes.chatDetail(chat.id)}
                      className="font-medium hover:underline"
                    >
                      {chat.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {chat.messageCount} messages ·{" "}
                      {new Date(chat.lastMessageAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRenameId(chat.id)
                        setRenameTitle(chat.title)
                      }}
                    >
                      Rename
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={remove.isPending}
                      onClick={() => {
                        if (window.confirm("Delete this chat permanently?")) {
                          remove.mutate(chat.id)
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
          {items.length === 0 ? (
            <li className="p-4 text-sm text-muted-foreground">
              No conversations yet. Start a new chat.
            </li>
          ) : null}
        </ul>
      )}
    </div>
  )
}

export function ChatDetailPage() {
  const { chatId } = useParams<{ chatId: string }>()
  const navigate = useNavigate()

  if (!chatId) {
    return <p className="p-6 text-sm text-muted-foreground">Missing chat id.</p>
  }

  return <ChatDetailView chatId={chatId} onBack={() => navigate(routes.chat)} />
}

function ChatDetailView(props: {
  readonly chatId: string
  readonly onBack: () => void
}) {
  const { chatId, onBack } = props
  const chats = useChatList()
  const messages = useChatMessages(chatId, { limit: 100 })
  const send = useSendChatMessage(chatId)
  const [draft, setDraft] = useState("")

  const chat = chats.data?.items.find((c) => c.id === chatId)
  const thread = messages.data?.items ?? []

  const sendError = send.error instanceof Error ? send.error.message : undefined

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col gap-4 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {chat?.title ?? "Chat"}
          </h1>
          <Button
            nativeButton={false}
            variant="link"
            className="h-auto p-0 text-sm"
            render={<Link to={routes.chat} />}
          >
            All conversations
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={onBack}>
          Back
        </Button>
      </div>

      <div className="flex min-h-[240px] flex-1 flex-col gap-4 overflow-y-auto rounded-lg border p-4">
        {messages.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading messages…</p>
        ) : thread.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Send a message to start the conversation.
          </p>
        ) : (
          thread.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          const text = draft.trim()
          if (!text) return
          send.mutate(
            { text },
            {
              onSuccess: () => setDraft(""),
            }
          )
        }}
      >
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about your library…"
          disabled={send.isPending}
        />
        <Button type="submit" disabled={send.isPending || !draft.trim()}>
          {send.isPending ? "Sending…" : "Send"}
        </Button>
      </form>
      {sendError ? (
        <p className="text-sm text-destructive">{sendError}</p>
      ) : null}
    </div>
  )
}

function MessageBubble(props: { readonly message: ChatMessageResponse }) {
  const { message } = props
  const isUser = message.role === "user"

  return (
    <div
      className={
        isUser
          ? "ml-8 rounded-lg bg-muted px-3 py-2 text-sm"
          : "mr-8 rounded-lg border px-3 py-2 text-sm"
      }
    >
      <p className="mb-1 text-xs font-medium text-muted-foreground">
        {isUser ? "You" : "Assistant"}
      </p>
      <p className="whitespace-pre-wrap">{message.text}</p>
      {message.languageCaveat ? (
        <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
          {message.languageCaveat}
        </p>
      ) : null}
      {message.citations.length > 0 ? (
        <ul className="mt-3 space-y-1 border-t pt-2 text-xs">
          {message.citations.map((citation, index) => (
            <CitationRow
              key={`${citation.contentId}-${index}`}
              citation={citation}
            />
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function CitationRow(props: { readonly citation: ChatCitation }) {
  const { citation } = props
  const label = citation.title || citation.sourceUrl || "Library item"

  return (
    <li className="text-muted-foreground">
      <Link
        to={routes.library}
        className="font-medium text-foreground hover:underline"
      >
        {label}
      </Link>
      {citation.sourceRemoved ? (
        <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] tracking-wide uppercase">
          source removed
        </span>
      ) : null}
      <p className="line-clamp-2">{citation.chunkText}</p>
    </li>
  )
}
