import type { RouteObject } from "react-router-dom"
import { routeSegments } from "@/config/routes"

export const uploadsRoutes: RouteObject[] = [
  {
    path: routeSegments.app.uploads,
    async lazy() {
      const { UploadsPage } =
        await import("@/features/uploads/pages/uploads-page")
      return { Component: UploadsPage }
    },
  },
]
