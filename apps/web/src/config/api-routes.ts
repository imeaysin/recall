const API_VERSION = "v1"

function apiPath(path: string) {
  return `/${API_VERSION}/${path}`
}

/** NestJS API paths — for `apiFetch()` only. */
export const apiRoutes = {
  health: apiPath("health"),
  me: apiPath("me"),
  content: apiPath("content"),
  contentUrl: apiPath("content/url"),
  contentItem: (id: string) => apiPath(`content/${id}`),
  contentRetry: (id: string) => apiPath(`content/${id}/retry`),
  uploads: apiPath("uploads"),
} as const
