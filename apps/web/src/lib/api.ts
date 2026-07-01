import { authClient } from "@workspace/auth/client"
import { DEFAULT_JWT_STORAGE_KEY } from "@workspace/auth/react"
import { env } from "@/config/env"
import {
  HttpErrorCode,
  type ApiErrorCode,
  type ApiErrorResponse,
  type ApiFieldError,
  type ApiSuccessResponse,
} from "@workspace/contracts"

const JWT_STORAGE_KEY = DEFAULT_JWT_STORAGE_KEY

async function getBearerToken(): Promise<string | null> {
  if (typeof sessionStorage !== "undefined") {
    const cached = sessionStorage.getItem(JWT_STORAGE_KEY)
    if (cached) return cached
  }

  const { data, error } = await authClient.token()
  if (error || !data?.token) return null

  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(JWT_STORAGE_KEY, data.token)
  }

  return data.token
}

export interface ApiErrorOptions {
  message: string
  status: number
  code: ApiErrorCode
  errors?: ApiFieldError[] | null
}

export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode
  readonly errors: ApiFieldError[] | null

  constructor({ message, status, code, errors = null }: ApiErrorOptions) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
    this.errors = errors
  }
}

function isApiErrorBody(value: unknown): value is ApiErrorResponse {
  if (typeof value !== "object" || value === null) return false

  return (
    "success" in value &&
    value.success === false &&
    "statusCode" in value &&
    typeof value.statusCode === "number" &&
    "code" in value &&
    typeof value.code === "string" &&
    "message" in value &&
    typeof value.message === "string"
  )
}

function isSuccessEnvelope<T>(value: unknown): value is ApiSuccessResponse<T> {
  if (typeof value !== "object" || value === null) return false

  return "success" in value && value.success === true && "data" in value
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = await getBearerToken()
  const headers = new Headers(init?.headers)

  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json")
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers,
    credentials: "include",
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as unknown

    if (isApiErrorBody(body)) {
      throw new ApiError({
        message: body.message,
        status: body.statusCode,
        code: body.code as ApiErrorCode,
        errors: body.errors ?? null,
      })
    }

    throw new ApiError({
      message: response.statusText,
      status: response.status,
      code: HttpErrorCode.INTERNAL_SERVER_ERROR,
    })
  }

  if (response.status === 204) {
    return undefined as T
  }

  const json = (await response.json()) as unknown

  if (!isSuccessEnvelope<T>(json)) {
    throw new ApiError({
      message: "Invalid API response",
      status: response.status,
      code: HttpErrorCode.INTERNAL_SERVER_ERROR,
    })
  }

  return json.data
}
