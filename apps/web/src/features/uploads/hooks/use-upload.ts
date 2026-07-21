import { useMutation } from "@tanstack/react-query"
import { UploadResponseSchema, type UploadResponse } from "@workspace/contracts"
import { toast } from "sonner"
import { apiRoutes } from "@/config/api-routes"
import { apiFetch } from "@/lib/api"

export function useUploadFileMutation() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)

      const promise = apiFetch<unknown>(apiRoutes.uploads, {
        method: "POST",
        body: formData,
      })

      toast.promise(promise, {
        loading: "Uploading…",
        success: "File uploaded",
        error: "Upload failed",
      })

      const data = await promise
      return UploadResponseSchema.parse(data)
    },
  })
}

export type { UploadResponse }
