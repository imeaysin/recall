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

const CHAT_THREAD_CONTENT_CLASS =
  "mx-auto w-full max-w-3xl gap-4 px-4 py-4 md:px-6"

type MessageOptions =
  | Omit<ChatMessageProps, keyof Message>
  | ((message: Message) => Omit<ChatMessageProps, keyof Message>)

interface ChatThreadProps {
  readonly messages: readonly Message[]
  readonly isTyping: boolean
  readonly showTimeStamps?: boolean
  readonly messageOptions?: MessageOptions
}

export function ChatThread(props: ChatThreadProps) {
  return (
    <MessageScrollerProvider autoScroll>
      <MessageScroller className="min-h-0 flex-1">
        <MessageScrollerViewport>
          <MessageScrollerContent className={CHAT_THREAD_CONTENT_CLASS}>
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
        <MessageScrollerButton />
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
