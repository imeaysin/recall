import { ThumbsDown, ThumbsUp } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import type { Message } from "@workspace/ui/components/ai/chat-message"
import { CopyButton } from "@workspace/ui/components/ai/copy-button"

interface ChatMessageActionsProps {
  readonly message: Message
  readonly onRateResponse?: (
    messageId: string,
    rating: "thumbs-up" | "thumbs-down"
  ) => void
}

export function ChatMessageActions(props: ChatMessageActionsProps) {
  if (!props.onRateResponse) {
    return (
      <CopyButton
        content={props.message.content}
        copyMessage="Copied response to clipboard!"
      />
    )
  }

  return (
    <>
      <div className="border-r pr-1">
        <CopyButton
          content={props.message.content}
          copyMessage="Copied response to clipboard!"
        />
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="size-6"
        onClick={() => props.onRateResponse?.(props.message.id, "thumbs-up")}
      >
        <ThumbsUp />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="size-6"
        onClick={() => props.onRateResponse?.(props.message.id, "thumbs-down")}
      >
        <ThumbsDown />
      </Button>
    </>
  )
}
