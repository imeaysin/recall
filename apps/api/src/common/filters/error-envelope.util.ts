import type {
  ApiErrorResponse,
  ApiErrorCode,
  ApiFieldError,
} from "@workspace/contracts"
import { getRequestId } from "@workspace/logger"

export function createErrorEnvelope(params: {
  status: number
  code: ApiErrorCode
  message: string
  path: string
  errors?: ApiFieldError[] | null
}): ApiErrorResponse {
  const requestId = getRequestId()
  return {
    success: false,
    statusCode: params.status,
    code: params.code,
    message: params.message,
    errors: params.errors ?? null,
    path: params.path,
    ...(requestId ? { requestId } : {}),
    timestamp: new Date().toISOString(),
  }
}
