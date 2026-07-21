import type { RouteObject } from "react-router-dom"
import { routeSegments } from "@/config/routes"
import { LibraryPage } from "./pages/library-page"

export const libraryRoutes: RouteObject[] = [
  {
    path: routeSegments.app.library,
    element: <LibraryPage />,
  },
]
