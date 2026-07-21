import type {
  Message,
  MessagePart,
  ToolInvocation,
} from "@workspace/ui/components/ai/chat-message"

interface CancelledToolResult {
  readonly content: string
  readonly __cancelled: boolean
}

const CANCELLED_TOOL_RESULT: CancelledToolResult = {
  content: "Tool execution was cancelled",
  __cancelled: true,
}

export function cancelPendingToolInvocations(
  messages: readonly Message[]
): Message[] | null {
  const latestMessages = [...messages]
  const lastAssistant = findLastAssistant(latestMessages)
  if (!lastAssistant) return null

  const updated = cancelAssistantTools(lastAssistant)
  if (!updated) return null

  const index = latestMessages.findIndex(
    (message) => message.id === lastAssistant.id
  )
  if (index === -1) return null

  latestMessages[index] = updated
  return latestMessages
}

function findLastAssistant(messages: readonly Message[]) {
  for (let index = messages.length - 1; index >= 0; index--) {
    const message = messages[index]
    if (message?.role === "assistant") return message
  }
  return undefined
}

function cancelAssistantTools(message: Message): Message | null {
  let needsUpdate = false
  let updatedMessage: Message = { ...message }

  if (message.toolInvocations) {
    const toolInvocations = message.toolInvocations.map(
      (toolInvocation): ToolInvocation => {
        if (toolInvocation.state !== "call") return toolInvocation
        needsUpdate = true
        return {
          ...toolInvocation,
          state: "result",
          result: { ...CANCELLED_TOOL_RESULT },
        }
      }
    )
    updatedMessage = { ...updatedMessage, toolInvocations }
  }

  if (message.parts && message.parts.length > 0) {
    const parts = message.parts.map((part): MessagePart => {
      if (
        part.type !== "tool-invocation" ||
        !part.toolInvocation ||
        part.toolInvocation.state !== "call"
      ) {
        return part
      }
      needsUpdate = true
      return {
        ...part,
        toolInvocation: {
          ...part.toolInvocation,
          state: "result",
          result: { ...CANCELLED_TOOL_RESULT },
        },
      }
    })
    updatedMessage = { ...updatedMessage, parts }
  }

  if (!needsUpdate) return null
  return updatedMessage
}
