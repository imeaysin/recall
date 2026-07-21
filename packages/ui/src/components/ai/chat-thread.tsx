import type { Message } from "@workspace/ui/components/ai/chat-message"
import {
  ChatMessage,
  type ChatMessageProps,
} from "@workspace/ui/components/ai/chat-message"
import { TypingIndicator } from "@workspace/ui/components/ai/typing-indicator"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@workspace/ui/components/message-scroller"
import { cn } from "@workspace/ui/lib/utils"

const CHAT_THREAD_CONTENT_CLASS =
  "mx-auto w-full max-w-3xl gap-6 px-4 py-6 md:px-6"

type MessageOptions =
  | Omit<ChatMessageProps, keyof Message>
  | ((message: Message) => Omit<ChatMessageProps, keyof Message>)

interface ChatThreadProps {
  readonly messages: readonly Message[]
  readonly isTyping: boolean
  readonly showTimeStamps?: boolean
  readonly messageOptions?: MessageOptions
  readonly contentClassName?: string
  readonly jumpButtonClassName?: string
}

export function ChatThread(props: ChatThreadProps) {
  return (
    <MessageScrollerProvider autoScroll>
      <MessageScroller className="size-full min-h-0">
        <MessageScrollerViewport>
          <MessageScrollerContent
            className={cn(CHAT_THREAD_CONTENT_CLASS, props.contentClassName)}
          >
            {props.messages.map((message) => (
              <ThreadMessage
                key={message.id}
                message={message}
                showTimeStamp={props.showTimeStamps ?? true}
                messageOptions={props.messageOptions}
              />
            ))}
            {props.isTyping ? (
              <MessageScrollerItem messageId="typing-indicator">
                <TypingIndicator />
              </MessageScrollerItem>
            ) : null}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton className={props.jumpButtonClassName} />
      </MessageScroller>
    </MessageScrollerProvider>
  )
}

function ThreadMessage(props: {
  readonly message: Message
  readonly showTimeStamp: boolean
  readonly messageOptions?: MessageOptions
}) {
  const additionalOptions =
    typeof props.messageOptions === "function"
      ? props.messageOptions(props.message)
      : props.messageOptions

  return (
    <MessageScrollerItem
      messageId={props.message.id}
      scrollAnchor={props.message.role === "user"}
    >
      <ChatMessage
        showTimeStamp={props.showTimeStamp}
        {...props.message}
        {...additionalOptions}
      />
    </MessageScrollerItem>
  )
}
