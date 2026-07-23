import type { RouteObject } from "react-router-dom"
import { routeSegments } from "@/config/routes"
import { LibraryContentDetailPage } from "./pages/library-content-detail-page"
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
      {
        path: routeSegments.app.libraryContent,
        element: <LibraryContentDetailPage />,
      },
    ],
  },
]
