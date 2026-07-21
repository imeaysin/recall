import { z } from "zod"
import {
  HttpErrorCode,
  SendChatMessageResponseSchema,
  type SendChatMessage,
  type SendChatMessageResponse,
} from "@workspace/contracts"
import { env } from "@/config/env"
import { apiRoutes } from "@/config/api-routes"
import { ApiError } from "@/lib/api"

const TOKEN_EVENT = "token"
const DONE_EVENT = "done"
const ERROR_EVENT = "error"

const TokenPayloadSchema = z.object({ text: z.string() }).strict()
const ErrorPayloadSchema = z.object({ message: z.string() }).strict()

export async function streamChatMessage(config: {
  readonly chatId: string
  readonly body: SendChatMessage
  readonly onToken: (chunk: string) => void
}): Promise<SendChatMessageResponse> {
  const response = await fetch(
    `${env.apiUrl}${apiRoutes.chatMessagesStream(config.chatId)}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(config.body),
    }
  )

  if (!response.ok || !response.body) {
    throw new ApiError({
      message: "Failed to stream chat reply",
      status: response.status,
      code: HttpErrorCode.INTERNAL_SERVER_ERROR,
    })
  }

  return readChatSse({
    body: response.body,
    onToken: config.onToken,
  })
}

async function readChatSse(config: {
  readonly body: ReadableStream<Uint8Array>
  readonly onToken: (chunk: string) => void
}): Promise<SendChatMessageResponse> {
  const reader = config.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let donePayload: SendChatMessageResponse | null = null

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split("\n\n")
    buffer = parts.at(-1) ?? ""
    for (const block of parts.slice(0, -1)) {
      const handled = handleSseBlock({
        block,
        onToken: config.onToken,
      })
      if (handled.kind === "done") {
        donePayload = handled.payload
      }
    }
  }

  if (!donePayload) {
    throw new ApiError({
      message: "Chat stream ended without a completed reply",
      status: 500,
      code: HttpErrorCode.INTERNAL_SERVER_ERROR,
    })
  }
  return donePayload
}

type SseHandleResult =
  | { readonly kind: "noop" }
  | { readonly kind: "done"; readonly payload: SendChatMessageResponse }

function handleSseBlock(config: {
  readonly block: string
  readonly onToken: (chunk: string) => void
}): SseHandleResult {
  const parsed = parseSseBlock(config.block)
  if (!parsed) return { kind: "noop" }

  if (parsed.event === TOKEN_EVENT) {
    const token = TokenPayloadSchema.safeParse(parsed.data)
    if (token.success && token.data.text.length > 0) {
      config.onToken(token.data.text)
    }
    return { kind: "noop" }
  }

  if (parsed.event === ERROR_EVENT) {
    const errorPayload = ErrorPayloadSchema.safeParse(parsed.data)
    throw new ApiError({
      message: errorPayload.success
        ? errorPayload.data.message
        : "Failed to stream chat reply",
      status: 500,
      code: HttpErrorCode.INTERNAL_SERVER_ERROR,
    })
  }

  if (parsed.event === DONE_EVENT) {
    const done = SendChatMessageResponseSchema.safeParse(parsed.data)
    if (!done.success) {
      throw new ApiError({
        message: "Invalid chat stream completion payload",
        status: 500,
        code: HttpErrorCode.INTERNAL_SERVER_ERROR,
      })
    }
    return { kind: "done", payload: done.data }
  }

  return { kind: "noop" }
}

function parseSseBlock(block: string): {
  readonly event: string
  readonly data: object
} | null {
  const lines = block.split("\n")
  let event = "message"
  const dataLines: string[] = []
  for (const line of lines) {
    if (line.startsWith("event:")) {
      event = line.slice("event:".length).trim()
      continue
    }
    if (line.startsWith("data:")) {
      dataLines.push(line.slice("data:".length).trim())
    }
  }
  if (dataLines.length === 0) return null
  try {
    const value: object | string | number | boolean | null = JSON.parse(
      dataLines.join("\n")
    )
    if (value === null || typeof value !== "object") return null
    return { event, data: value }
  } catch {
    return null
  }
}
