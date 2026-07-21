"use client"

import { useCallback, useEffect, useRef } from "react"
import type { MutableRefObject } from "react"

import { cn } from "@workspace/ui/lib/utils"
import type { Message } from "@workspace/ui/components/ai/chat-message"
import { ChatForm } from "@workspace/ui/components/ai/chat-form"
import { ChatMessageActions } from "@workspace/ui/components/ai/chat-message-actions"
import { ChatThread } from "@workspace/ui/components/ai/chat-thread"
import { cancelPendingToolInvocations } from "@workspace/ui/components/ai/chat-stop"
import { MessageInput } from "@workspace/ui/components/ai/message-input"
import { PromptSuggestions } from "@workspace/ui/components/ai/prompt-suggestions"

const CHAT_COMPOSER_CLASS =
  "mx-auto w-full max-w-3xl shrink-0 px-4 pb-4 md:px-6 md:pb-6"

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
    <div className={cn("flex h-full min-h-0 w-full flex-col", props.className)}>
      {props.messages.length === 0 &&
      props.append &&
      props.suggestions &&
      !props.isGenerating ? (
        <div className={CHAT_COMPOSER_CLASS}>
          <PromptSuggestions
            label="Try these prompts ✨"
            append={props.append}
            suggestions={props.suggestions}
          />
        </div>
      ) : null}

      {props.messages.length > 0 ? (
        <ChatThread
          messages={props.messages}
          isTyping={isTyping}
          messageOptions={messageOptions}
        />
      ) : null}

      <div className={CHAT_COMPOSER_CLASS}>
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
  )
}
Chat.displayName = "Chat"

export { ChatForm } from "@workspace/ui/components/ai/chat-form"

function useChatStop(config: {
  readonly stop?: () => void
  readonly setMessages?: (messages: Message[]) => void
  readonly messagesRef: MutableRefObject<Message[]>
}) {
  return useCallback(() => {
    config.stop?.()
    if (!config.setMessages) return
    const next = cancelPendingToolInvocations(config.messagesRef.current)
    if (!next) return
    config.setMessages(next)
  }, [config])
}
