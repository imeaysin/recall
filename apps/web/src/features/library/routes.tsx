import type { RouteObject } from "react-router-dom"
import { routeSegments } from "@/config/routes"
import { LibraryPage } from "./pages/library-page"
import { LibraryTrashPage } from "./pages/library-trash-page"

export const libraryRoutes: RouteObject[] = [
  {
    path: routeSegments.app.library,
    children: [
      {
        index: true,
        element: <LibraryPage />,
      },
      {
        path: routeSegments.app.libraryTrash,
        element: <LibraryTrashPage />,
      },
    ],
  },
]
