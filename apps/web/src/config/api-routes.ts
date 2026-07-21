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
  contentFile: apiPath("content/file"),
  contentTrash: apiPath("content/trash"),
  contentTrashRestore: (trashId: string) =>
    apiPath(`content/trash/${trashId}/restore`),
  contentItem: (id: string) => apiPath(`content/${id}`),
  contentRetry: (id: string) => apiPath(`content/${id}/retry`),
  contentRegenerate: (id: string) => apiPath(`content/${id}/regenerate`),
  contentPermanentDelete: (id: string) => apiPath(`content/${id}/permanent`),
  topics: apiPath("topics"),
  topicItem: (id: string) => apiPath(`topics/${id}`),
  topicMerge: (id: string) => apiPath(`topics/${id}/merge`),
  chats: apiPath("chats"),
  chatItem: (id: string) => apiPath(`chats/${id}`),
  chatMessages: (id: string) => apiPath(`chats/${id}/messages`),
  chatMessagesStream: (id: string) => apiPath(`chats/${id}/messages/stream`),
  uploads: apiPath("uploads"),
} as const
