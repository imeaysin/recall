"use client"

import { useCallback, useEffect, useRef } from "react"
import type { RefObject } from "react"

import { cn } from "@workspace/ui/lib/utils"
import type { Message } from "@workspace/ui/components/ai/chat-message"
import { ChatForm } from "@workspace/ui/components/ai/chat-form"
import { ChatMessageActions } from "@workspace/ui/components/ai/chat-message-actions"
import { ChatThread } from "@workspace/ui/components/ai/chat-thread"
import { cancelPendingToolInvocations } from "@workspace/ui/components/ai/chat-stop"
import { MessageInput } from "@workspace/ui/components/ai/message-input"
import { PromptSuggestions } from "@workspace/ui/components/ai/prompt-suggestions"

const COMPOSER_SHELL_CLASS =
  "pointer-events-none absolute inset-x-0 bottom-0 z-10 pt-4 pb-4 md:pb-6"

const COMPOSER_INNER_CLASS =
  "pointer-events-auto mx-auto w-full max-w-4xl px-4 md:px-6"

const THREAD_PAD_CLASS = "pt-16 pb-36 md:pb-40"
const JUMP_BUTTON_CLASS =
  "data-[direction=end]:bottom-28 md:data-[direction=end]:bottom-32"

interface ChatPropsBase {
  handleSubmit: (
    event?: { preventDefault?: () => void },
    options?: { experimental_attachments?: FileList }
  ) => void
  messages: Message[]
  input: string
  className?: string
  handleInputChange: React.ChangeEventHandler<HTMLTextAreaElement>
  isGenerating: boolean
  stop?: () => void
  onRateResponse?: (
    messageId: string,
    rating: "thumbs-up" | "thumbs-down"
  ) => void
  setMessages?: (messages: Message[]) => void
  transcribeAudio?: (blob: Blob) => Promise<string>
  placeholder?: string
  allowAttachments?: boolean
}

interface ChatPropsWithoutSuggestions extends ChatPropsBase {
  append?: never
  suggestions?: never
}

interface ChatPropsWithSuggestions extends ChatPropsBase {
  append: (message: { role: "user"; content: string }) => void
  suggestions: string[]
}

type ChatProps = ChatPropsWithoutSuggestions | ChatPropsWithSuggestions

export function Chat(props: ChatProps) {
  const isTyping = props.messages.at(-1)?.role === "user" && props.isGenerating
  const messagesRef = useRef(props.messages)
  const showSuggestions =
    props.messages.length === 0 &&
    Boolean(props.append) &&
    Boolean(props.suggestions) &&
    !props.isGenerating

  useEffect(() => {
    messagesRef.current = props.messages
  }, [props.messages])

  const handleStop = useChatStop({
    stop: props.stop,
    setMessages: props.setMessages,
    messagesRef,
  })

  const messageOptions = useCallback(
    (message: Message) => ({
      actions: (
        <ChatMessageActions
          message={message}
          onRateResponse={props.onRateResponse}
        />
      ),
    }),
    [props.onRateResponse]
  )

  return (
    <div className={cn("relative size-full min-h-0", props.className)}>
      {props.messages.length > 0 ? (
        <div className="absolute inset-0">
          <ChatThread
            messages={props.messages}
            isTyping={isTyping}
            messageOptions={messageOptions}
            contentClassName={THREAD_PAD_CLASS}
            jumpButtonClassName={JUMP_BUTTON_CLASS}
          />
        </div>
      ) : null}

      {showSuggestions && props.append && props.suggestions ? (
        <div className="absolute inset-0 flex items-center justify-center px-4 pt-12 pb-28 md:px-6">
          <PromptSuggestions
            label="How can I help with your library?"
            append={props.append}
            suggestions={props.suggestions}
          />
        </div>
      ) : null}

      <div className={COMPOSER_SHELL_CLASS}>
        <div className={COMPOSER_INNER_CLASS}>
          <ChatForm handleSubmit={props.handleSubmit}>
            {({ files, setFiles }) =>
              props.allowAttachments ? (
                <MessageInput
                  value={props.input}
                  onChange={props.handleInputChange}
                  placeholder={props.placeholder}
                  allowAttachments
                  files={files}
                  setFiles={setFiles}
                  stop={handleStop}
                  isGenerating={props.isGenerating}
                  transcribeAudio={props.transcribeAudio}
                />
              ) : (
                <MessageInput
                  value={props.input}
                  onChange={props.handleInputChange}
                  placeholder={
                    props.placeholder ?? "Ask anything... type @ to add context"
                  }
                  allowAttachments={false}
                  stop={handleStop}
                  isGenerating={props.isGenerating}
                  transcribeAudio={props.transcribeAudio}
                />
              )
            }
          </ChatForm>
        </div>
      </div>
    </div>
  )
}
Chat.displayName = "Chat"

export { ChatForm } from "@workspace/ui/components/ai/chat-form"

function useChatStop(config: {
  readonly stop?: () => void
  readonly setMessages?: (messages: Message[]) => void
  readonly messagesRef: RefObject<Message[]>
}) {
  return useCallback(() => {
    config.stop?.()
    if (!config.setMessages) return
    const next = cancelPendingToolInvocations(config.messagesRef.current)
    if (!next) return
    config.setMessages(next)
  }, [config])
}
