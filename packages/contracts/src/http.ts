import { z } from "zod"

type ApiEnvelopeMeta = {
  id: string
  title?: string
  description?: string
}

/** Standard `{ data: T }` envelope applied by the API response interceptor. */
export function apiDataResponse<T extends z.ZodType>(
  payload: T,
  meta?: ApiEnvelopeMeta
) {
  const envelope = z.object({
    data: payload.describe("Response payload"),
  })

  return meta ? envelope.meta(meta) : envelope
}
