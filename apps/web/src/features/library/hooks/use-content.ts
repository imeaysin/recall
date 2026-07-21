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

export function useContentList(libraryStatus?: "QUEUE" | "ARCHIVE") {
  const params = libraryStatus ? `?libraryStatus=${libraryStatus}` : undefined
  return useQuery({
    queryKey: contentKeys.list(params),
    queryFn: () =>
      apiFetch<ContentListResponse>(`${apiRoutes.content}${params ?? ""}`),
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? []
      const processing = items.some(
        (item) => item.status !== "COMPLETED" && item.status !== "FAILED"
      )
      return processing ? 2000 : false
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
