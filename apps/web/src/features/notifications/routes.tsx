import type { RouteObject } from "react-router-dom"
import { routeSegments } from "@/config/routes"

export const notificationRoutes: RouteObject[] = [
  {
    path: routeSegments.app.notifications,
    async lazy() {
      const { NotificationsPage } =
        await import("@/features/notifications/pages/notifications-page")
      return { Component: NotificationsPage }
    },
  },
]
