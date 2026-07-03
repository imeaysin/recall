export type NoteActorScope = {
  organizationId: string
  userId: string
}

export type NoteMutationScope = NoteActorScope & {
  noteId: string
}

export type BulkNoteMutationScope = NoteActorScope & {
  ids: string[]
}
