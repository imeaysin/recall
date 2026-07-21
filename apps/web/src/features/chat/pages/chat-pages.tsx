import { Link, useNavigate, useParams } from "react-router-dom"
import { useState } from "react"
import { MessageSquareIcon, PlusIcon, SendIcon } from "lucide-react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Bubble,
  BubbleContent,
  BubbleGroup,
} from "@workspace/ui/components/bubble"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import {
  Message,
  MessageContent,
  MessageHeader,
} from "@workspace/ui/components/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@workspace/ui/components/message-scroller"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { routes } from "@/config/routes"
import { PageHeader } from "@/features/shell/components/page-header"
import { PageShell } from "@/features/shell/components/page-shell"
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
  const create = useCreateChat()
  const navigate = useNavigate()
  const chats = useChatList()
  const count = chats.data?.items.length ?? 0

  return (
    <PageShell>
      <PageHeader
        title="Chat"
        description="Ask questions over your library with citations. Pick a conversation from the sidebar, or start a new one."
      />

      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MessageSquareIcon />
          </EmptyMedia>
          <EmptyTitle>
            {count === 0 ? "No conversations yet" : "Select a conversation"}
          </EmptyTitle>
          <EmptyDescription>
            {count === 0
              ? "Start a chat to ask questions across your saved knowledge."
              : "Choose a thread in the sidebar to continue, or create a new chat."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            disabled={create.isPending}
            onClick={() =>
              create.mutate(undefined, {
                onSuccess: (chat) => navigate(routes.chatDetail(chat.id)),
              })
            }
          >
            <PlusIcon data-icon="inline-start" />
            {create.isPending ? "Creating…" : "New chat"}
          </Button>
        </EmptyContent>
      </Empty>
    </PageShell>
  )
}

export function ChatDetailPage() {
  const { chatId } = useParams<{ chatId: string }>()
  const navigate = useNavigate()

  if (!chatId) {
    return <p className="text-sm text-muted-foreground">Missing chat id.</p>
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
  const update = useUpdateChat()
  const remove = useDeleteChat()
  const [draft, setDraft] = useState("")
  const [renaming, setRenaming] = useState(false)
  const [renameTitle, setRenameTitle] = useState("")

  const chat = chats.data?.items.find((c) => c.id === chatId)
  const thread = messages.data?.items ?? []
  const sendError = send.error instanceof Error ? send.error.message : undefined
  const actionPending = update.isPending || remove.isPending

  return (
    <PageShell className="min-h-[calc(100vh-8rem)] flex-1 gap-4">
      <PageHeader
        title={renaming ? "Rename chat" : (chat?.title ?? "Chat")}
        description={
          renaming ? undefined : "Answers cite sources from your library."
        }
        actions={
          renaming ? undefined : (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={actionPending}
                onClick={() => {
                  setRenameTitle(chat?.title ?? "")
                  setRenaming(true)
                }}
              >
                Rename
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={actionPending}
                onClick={() => {
                  if (window.confirm("Delete this chat permanently?")) {
                    remove.mutate(chatId, {
                      onSuccess: () => onBack(),
                    })
                  }
                }}
              >
                Delete
              </Button>
            </>
          )
        }
      />

      {renaming ? (
        <FieldGroup className="max-w-md">
          <Field>
            <FieldLabel htmlFor="chat-title">Title</FieldLabel>
            <Input
              id="chat-title"
              value={renameTitle}
              onChange={(event) => setRenameTitle(event.target.value)}
              maxLength={120}
            />
          </Field>
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={update.isPending}
              onClick={() => {
                const title = renameTitle.trim()
                if (!title) return
                update.mutate(
                  { id: chatId, body: { title } },
                  { onSuccess: () => setRenaming(false) }
                )
              }}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRenaming(false)}
            >
              Cancel
            </Button>
          </div>
        </FieldGroup>
      ) : null}

      <MessageScrollerProvider autoScroll>
        <MessageScroller className="min-h-0 flex-1 rounded-xl border">
          <MessageScrollerViewport>
            <MessageScrollerContent>
              <ChatThreadBody isLoading={messages.isLoading} thread={thread} />
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      <form
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
        <InputGroup className="h-10">
          <InputGroupInput
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask about your library…"
            disabled={send.isPending}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="submit"
              disabled={send.isPending || !draft.trim()}
              aria-label="Send"
            >
              <SendIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        {sendError ? (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription>{sendError}</AlertDescription>
          </Alert>
        ) : null}
      </form>
    </PageShell>
  )
}

function ChatThreadBody(props: {
  readonly isLoading: boolean
  readonly thread: readonly ChatMessageResponse[]
}) {
  if (props.isLoading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-16 w-3/4 rounded-lg" />
        <Skeleton className="ml-auto h-16 w-2/3 rounded-lg" />
      </div>
    )
  }

  if (props.thread.length === 0) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Send a message to start the conversation.
      </div>
    )
  }

  return (
    <>
      {props.thread.map((message) => (
        <MessageScrollerItem
          key={message.id}
          messageId={message.id}
          scrollAnchor={message.role === "user"}
        >
          <ChatMessageRow message={message} />
        </MessageScrollerItem>
      ))}
    </>
  )
}

function ChatMessageRow(props: { readonly message: ChatMessageResponse }) {
  const { message } = props
  const isUser = message.role === "user"

  return (
    <Message align={isUser ? "end" : "start"}>
      <MessageHeader>{isUser ? "You" : "Assistant"}</MessageHeader>
      <MessageContent>
        <BubbleGroup>
          <Bubble variant={isUser ? "default" : "outline"}>
            <BubbleContent>
              <p className="whitespace-pre-wrap">{message.text}</p>
              {message.languageCaveat ? (
                <p className="mt-2 text-xs opacity-80">
                  {message.languageCaveat}
                </p>
              ) : null}
              {message.citations.length > 0 ? (
                <ul className="mt-3 flex flex-col gap-2 border-t border-border/50 pt-2 text-xs">
                  {message.citations.map((citation, index) => (
                    <CitationRow
                      key={`${citation.contentId}-${index}`}
                      citation={citation}
                    />
                  ))}
                </ul>
              ) : null}
            </BubbleContent>
          </Bubble>
        </BubbleGroup>
      </MessageContent>
    </Message>
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
        <Badge variant="secondary" className="ml-2">
          source removed
        </Badge>
      ) : null}
      <p className="line-clamp-2">{citation.chunkText}</p>
    </li>
  )
}
