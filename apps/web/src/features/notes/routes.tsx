import type { RouteObject } from "react-router-dom"
import { NotesPage } from "@/features/notes/pages/notes-page"
import { paths } from "@/config/paths"

export const notesRoutes: RouteObject[] = [
  { path: paths.notes, element: <NotesPage /> },
]
