import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type {
  ContentListResponse,
  ContentResponse,
  SaveUrlContent,
} from "@workspace/contracts"
import { apiFetch } from "@/lib/api"
import { apiRoutes } from "@/config/api-routes"

const contentKeys = {
  all: ["content"] as const,
  list: (params?: string) =>
    [...contentKeys.all, "list", params ?? ""] as const,
  detail: (id: string) => [...contentKeys.all, "detail", id] as const,
}

const ACTIVELY_PROCESSING = new Set([
  "EXTRACTING",
  "METADATA",
  "GRAPH",
  "EMBEDDING",
])

/** Poll only while work is running — not while waiting/retrying with an error. */
function needsIngestionPolling(items: readonly ContentResponse[]): boolean {
  return items.some((item) => {
    if (ACTIVELY_PROCESSING.has(item.status)) return true
    return item.status === "PENDING" && !item.errorCode
  })
}

export function useContentList(libraryStatus?: "QUEUE" | "ARCHIVE") {
  const params = libraryStatus ? `?libraryStatus=${libraryStatus}` : undefined
  return useQuery({
    queryKey: contentKeys.list(params),
    queryFn: () =>
      apiFetch<ContentListResponse>(`${apiRoutes.content}${params ?? ""}`),
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? []
      return needsIngestionPolling(items) ? 2000 : false
    },
  })
}

export function useSaveUrlContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: SaveUrlContent) =>
      apiFetch<ContentResponse>(apiRoutes.contentUrl, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contentKeys.all })
    },
  })
}

export function useRetryContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<ContentResponse>(apiRoutes.contentRetry(id), {
        method: "POST",
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contentKeys.all })
    },
  })
}
