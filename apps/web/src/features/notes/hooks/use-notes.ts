import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useActiveOrganizationId } from "@/lib/session"
import {
  BulkDeleteNotesSchema,
  CreateNoteSchema,
  NoteResponseSchema,
  NotesListResponseSchema,
  UpdateNoteSchema,
  type BulkDeleteNotesInput,
  type CreateNoteInput,
  type NoteResponse,
  type NotesListResponse,
  type UpdateNoteInput,
} from "@workspace/contracts"
import { toast } from "sonner"
import { apiRoutes } from "@/config/api-routes"
import { apiFetch } from "@/lib/api"

const NOTE_SEARCH_PARAM = "search" as const

export function notesQueryKey(organizationId?: string | null) {
  return ["notes", organizationId ?? null] as const
}

function notesListPath(search: string): string {
  const trimmed = search.trim()
  if (!trimmed) return apiRoutes.notes

  const params = new URLSearchParams({ [NOTE_SEARCH_PARAM]: trimmed })
  return `${apiRoutes.notes}?${params.toString()}`
}

type PatchNotesListOptions = {
  queryClient: ReturnType<typeof useQueryClient>
  organizationId: string | null | undefined
  updater: (items: NoteResponse[]) => NoteResponse[]
}

function patchNotesList({
  queryClient,
  organizationId,
  updater,
}: PatchNotesListOptions) {
  queryClient.setQueriesData<NotesListResponse>(
    { queryKey: notesQueryKey(organizationId) },
    (current) => {
      if (!current) return current
      return { items: updater(current.items) }
    }
  )
}

export function useNotesQuery(search = "") {
  const organizationId = useActiveOrganizationId()
  const normalizedSearch = search.trim()

  return useQuery({
    queryKey: [...notesQueryKey(organizationId), normalizedSearch],
    queryFn: async () => {
      const data = await apiFetch<NotesListResponse>(
        notesListPath(normalizedSearch)
      )
      return NotesListResponseSchema.parse(data)
    },
    enabled: !!organizationId,
    placeholderData: keepPreviousData,
  })
}

export function useCreateNoteMutation() {
  const queryClient = useQueryClient()
  const organizationId = useActiveOrganizationId()

  return useMutation({
    mutationFn: async (input: CreateNoteInput) => {
      if (!organizationId) {
        throw new Error(
          "No active workspace. Wait a moment for your workspace to activate, then try again."
        )
      }
      const promise = (async () => {
        const body = CreateNoteSchema.parse(input)
        const data = await apiFetch<NoteResponse>(apiRoutes.notes, {
          method: "POST",
          body: JSON.stringify(body),
        })
        return NoteResponseSchema.parse(data)
      })()
      toast.promise(promise, {
        loading: "Creating note…",
        success: "Note created",
        error: "Could not create note",
      })
      return promise
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notesQueryKey(organizationId),
      })
    },
  })
}

export function useUpdateNoteMutation() {
  const queryClient = useQueryClient()
  const organizationId = useActiveOrganizationId()

  return useMutation({
    mutationFn: async ({
      noteId,
      input,
    }: {
      noteId: string
      input: UpdateNoteInput
    }) => {
      const promise = (async () => {
        const body = UpdateNoteSchema.parse(input)
        const data = await apiFetch<NoteResponse>(apiRoutes.note(noteId), {
          method: "PATCH",
          body: JSON.stringify(body),
        })
        return NoteResponseSchema.parse(data)
      })()
      toast.promise(promise, {
        loading: "Updating note…",
        success: "Note updated",
        error: "Could not update note",
      })
      return promise
    },
    onSuccess: (note) => {
      patchNotesList({
        queryClient,
        organizationId,
        updater: (items) =>
          items.map((item) => (item.id === note.id ? note : item)),
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: notesQueryKey(organizationId),
      })
    },
  })
}

export function useDeleteNoteMutation() {
  const queryClient = useQueryClient()
  const organizationId = useActiveOrganizationId()

  return useMutation({
    mutationFn: async (noteId: string) => {
      const promise = apiFetch(apiRoutes.note(noteId), {
        method: "DELETE",
      })
      toast.promise(promise, {
        loading: "Deleting note…",
        success: "Note deleted",
        error: "Could not delete note",
      })
      return promise
    },
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({
        queryKey: notesQueryKey(organizationId),
      })
      patchNotesList({
        queryClient,
        organizationId,
        updater: (items) => items.filter((item) => item.id !== noteId),
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: notesQueryKey(organizationId),
      })
    },
  })
}

export function useBulkDeleteNotesMutation() {
  const queryClient = useQueryClient()
  const organizationId = useActiveOrganizationId()

  return useMutation({
    mutationFn: async (input: BulkDeleteNotesInput) => {
      const promise = (async () => {
        const body = BulkDeleteNotesSchema.parse(input)
        return apiFetch<{ deletedCount: number }>(apiRoutes.notesBulkDelete, {
          method: "POST",
          body: JSON.stringify(body),
        })
      })()
      toast.promise(promise, {
        loading: "Deleting notes…",
        success: (result) =>
          result.deletedCount === 1
            ? "1 note deleted"
            : `${result.deletedCount} notes deleted`,
        error: "Could not delete notes",
      })
      return promise
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: notesQueryKey(organizationId),
      })
      const ids = new Set(input.ids)
      patchNotesList({
        queryClient,
        organizationId,
        updater: (items) => items.filter((item) => !ids.has(item.id)),
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: notesQueryKey(organizationId),
      })
    },
  })
}
