import { randomUUID } from "node:crypto"
import type { INestApplication } from "@nestjs/common"
import type { NextFunction, Request, Response } from "express"
import { runWithRequestContext } from "@workspace/logger"

const REQUEST_ID_HEADER = "x-request-id"

export function applyRequestContext(app: INestApplication) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const incoming = req.headers[REQUEST_ID_HEADER]

    const requestId =
      typeof incoming === "string" && incoming.length > 0
        ? incoming
        : randomUUID()

    res.setHeader("X-Request-Id", requestId)
    runWithRequestContext({ requestId }, () => next())
  })
}
