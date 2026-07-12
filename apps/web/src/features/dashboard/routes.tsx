import type { RouteObject } from "react-router-dom"
import { routeSegments } from "@/config/routes"

export const dashboardRoutes: RouteObject[] = [
  {
    path: routeSegments.app.dashboard,
    async lazy() {
      const { default: DashboardPage } =
        await import("@/features/dashboard/pages/dashboard-page")
      return { Component: DashboardPage }
    },
  },
]
