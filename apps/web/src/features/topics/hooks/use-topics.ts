import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type {
  CreateTopic,
  MergeTopic,
  TopicListResponse,
  TopicResponse,
  UpdateTopic,
} from "@workspace/contracts"
import { apiFetch } from "@/lib/api"
import { apiRoutes } from "@/config/api-routes"

const topicKeys = {
  all: ["topics"] as const,
  list: (params?: string) => [...topicKeys.all, "list", params ?? ""] as const,
}

export function useTopicList(includeRoot = false) {
  const params = includeRoot ? "?includeRoot=true" : ""
  return useQuery({
    queryKey: topicKeys.list(params),
    queryFn: () => apiFetch<TopicListResponse>(`${apiRoutes.topics}${params}`),
  })
}

export function useCreateTopic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateTopic) =>
      apiFetch<TopicResponse>(apiRoutes.topics, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: topicKeys.all })
    },
  })
}

export function useUpdateTopic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateTopic }) =>
      apiFetch<TopicResponse>(apiRoutes.topicItem(id), {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: topicKeys.all })
    },
  })
}

export function useDeleteTopic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(apiRoutes.topicItem(id), {
        method: "DELETE",
        body: JSON.stringify({ confirm: true }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: topicKeys.all })
    },
  })
}

export function useMergeTopic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: MergeTopic }) =>
      apiFetch<TopicResponse>(apiRoutes.topicMerge(id), {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: topicKeys.all })
    },
  })
}
