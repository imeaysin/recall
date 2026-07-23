import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type {
  ContentListResponse,
  ContentResponse,
  ContentTrashListResponse,
  RegenerateContent,
  SaveUrlContent,
  UpdateContent,
} from "@workspace/contracts"
import { apiFetch } from "@/lib/api"
import { apiRoutes } from "@/config/api-routes"

const contentKeys = {
  all: ["content"] as const,
  list: (params?: string) => ["content", "list", params ?? ""] as const,
  trash: ["content", "trash"] as const,
  detail: (id: string) => ["content", "detail", id] as const,
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

function invalidateContent(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: contentKeys.all })
  void queryClient.invalidateQueries({ queryKey: contentKeys.trash })
}

export function useContentList(options?: {
  libraryStatus?: "QUEUE" | "ARCHIVE"
  search?: string
}) {
  const params = new URLSearchParams()
  if (options?.libraryStatus) {
    params.set("libraryStatus", options.libraryStatus)
  }
  if (options?.search) {
    params.set("search", options.search)
  }
  const query = params.toString()
  const suffix = query ? `?${query}` : ""

  return useQuery({
    queryKey: contentKeys.list(suffix),
    queryFn: () =>
      apiFetch<ContentListResponse>(`${apiRoutes.content}${suffix}`),
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? []
      return needsIngestionPolling(items) ? 2000 : false
    },
  })
}

export function useContentTrashList() {
  return useQuery({
    queryKey: contentKeys.trash,
    queryFn: () => apiFetch<ContentTrashListResponse>(apiRoutes.contentTrash),
  })
}

export function useContentDetail(id: string) {
  return useQuery({
    queryKey: contentKeys.detail(id),
    queryFn: () => apiFetch<ContentResponse>(apiRoutes.contentItem(id)),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const item = query.state.data
      if (!item) return false
      return needsIngestionPolling([item]) ? 2000 : false
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
    onSuccess: () => invalidateContent(queryClient),
  })
}

export function useSavePdfContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData()
      form.append("file", file)
      return apiFetch<ContentResponse>(apiRoutes.contentFile, {
        method: "POST",
        body: form,
      })
    },
    onSuccess: () => invalidateContent(queryClient),
  })
}

export function useUpdateContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateContent }) =>
      apiFetch<ContentResponse>(apiRoutes.contentItem(id), {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => invalidateContent(queryClient),
  })
}

export function useSoftDeleteContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(apiRoutes.contentItem(id), { method: "DELETE" }),
    onSuccess: () => invalidateContent(queryClient),
  })
}

export function useRegenerateContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: RegenerateContent }) =>
      apiFetch<ContentResponse>(apiRoutes.contentRegenerate(id), {
        method: "POST",
        body: JSON.stringify(body ?? {}),
      }),
    onSuccess: () => invalidateContent(queryClient),
  })
}

export function useRestoreTrashContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (trashId: string) =>
      apiFetch<ContentResponse>(apiRoutes.contentTrashRestore(trashId), {
        method: "POST",
      }),
    onSuccess: () => invalidateContent(queryClient),
  })
}

export function usePermanentDeleteContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (contentId: string) =>
      apiFetch(apiRoutes.contentPermanentDelete(contentId), {
        method: "DELETE",
      }),
    onSuccess: () => invalidateContent(queryClient),
  })
}

export function useRetryContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<ContentResponse>(apiRoutes.contentRetry(id), {
        method: "POST",
      }),
    onSuccess: () => invalidateContent(queryClient),
  })
}
