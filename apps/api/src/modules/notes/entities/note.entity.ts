import type { ObjectId } from "mongodb"

/** MongoDB document shape — maps to {@link NoteResponse} via `toNoteResponse`. */
export type NoteEntity = {
  _id: ObjectId
  organizationId: string
  userId: string
  title: string
  body: string
  createdAt: Date
  updatedAt: Date
}

export type NewNoteEntity = Pick<
  NoteEntity,
  "organizationId" | "userId" | "title" | "body"
>
