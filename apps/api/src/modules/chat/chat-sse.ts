import type { Response } from "express"

export const SSE_CONTENT_TYPE = "text/event-stream"

export function beginSseResponse(response: Response): void {
  response.status(201)
  response.setHeader("Content-Type", SSE_CONTENT_TYPE)
  response.setHeader("Cache-Control", "no-cache, no-transform")
  response.setHeader("Connection", "keep-alive")
  response.flushHeaders?.()
}

export function writeSseEvent(config: {
  readonly response: Response
  readonly event: string
  readonly data: object
}): void {
  config.response.write(
    `event: ${config.event}\ndata: ${JSON.stringify(config.data)}\n\n`
  )
}

export function endSseResponse(response: Response): void {
  if (!response.writableEnded) {
    response.end()
  }
}
