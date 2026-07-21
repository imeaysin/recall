import { useNavigate, useParams } from "react-router-dom"
import { routes } from "@/config/routes"
import { PageShell } from "@/features/shell/components/page-shell"
import {
  CHAT_MISSING_ID_MESSAGE,
  CHAT_PAGE_SHELL_CLASS,
} from "@/features/chat/constants"
import { ChatConversation } from "@/features/chat/components/chat-conversation"
import { ChatDetailHeader } from "@/features/chat/components/chat-detail-header"
import { ChatSendErrorAlert } from "@/features/chat/components/chat-send-error-alert"
import { useChatDetail } from "@/features/chat/hooks/use-chat-detail"

export function ChatDetailPage() {
  const { chatId } = useParams<{ chatId: string }>()
  const navigate = useNavigate()

  if (!chatId) {
    return (
      <p className="text-sm text-muted-foreground">{CHAT_MISSING_ID_MESSAGE}</p>
    )
  }

  return (
    <ChatDetailView
      key={chatId}
      chatId={chatId}
      onBack={() => navigate(routes.chat)}
    />
  )
}

function ChatDetailView(props: {
  readonly chatId: string
  readonly onBack: () => void
}) {
  const detail = useChatDetail(props.chatId)

  return (
    <PageShell className={CHAT_PAGE_SHELL_CLASS}>
      <ChatDetailHeader
        title={detail.chat?.title}
        renaming={detail.renaming}
        renameTitle={detail.renameTitle}
        actionPending={detail.actionPending}
        updatePending={detail.update.isPending}
        onRenameTitleChange={detail.setRenameTitle}
        onStartRename={() => {
          detail.setRenameTitle(detail.chat?.title ?? "")
          detail.setRenaming(true)
        }}
        onCancelRename={() => detail.setRenaming(false)}
        onSaveRename={() => {
          const title = detail.renameTitle.trim()
          if (!title) return
          detail.update.mutate(
            { id: props.chatId, body: { title } },
            { onSuccess: () => detail.setRenaming(false) }
          )
        }}
        onDelete={() => {
          detail.remove.mutate(props.chatId, { onSuccess: props.onBack })
        }}
      />

      {detail.sendError ? (
        <ChatSendErrorAlert
          message={detail.sendError}
          canRetry={Boolean(detail.displayInflight)}
          onRetry={detail.retryFailedSend}
        />
      ) : null}

      <ChatConversation
        isLoading={detail.messagesQuery.isLoading}
        showSuggestions={detail.showSuggestions}
        messages={detail.messages}
        input={detail.input}
        isGenerating={detail.waitingOnReply}
        onInputChange={detail.setInput}
        onSubmit={() => detail.submitMessage(detail.input)}
        onAppend={(content) => detail.submitMessage(content)}
      />
    </PageShell>
  )
}
