import type { RouteObject } from "react-router-dom"
import { routeSegments } from "@/config/routes"

export const notesRoutes: RouteObject[] = [
  {
    path: routeSegments.app.notes,
    async lazy() {
      const { NotesPage } = await import("@/features/notes/pages/notes-page")
      return { Component: NotesPage }
    },
  },
]
