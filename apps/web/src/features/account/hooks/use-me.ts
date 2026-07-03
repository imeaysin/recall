import { useQuery } from "@tanstack/react-query"
import { MeResponseSchema, type MeResponse } from "@workspace/contracts"
import { apiRoutes } from "@/config/api-routes"
import { apiFetch } from "@/lib/api"

export const meQueryKey = ["me"] as const

export function useMe() {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: async (): Promise<MeResponse> => {
      const data = await apiFetch<unknown>(apiRoutes.me)
      return MeResponseSchema.parse(data)
    },
  })
}
