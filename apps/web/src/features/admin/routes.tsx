import { Navigate } from "react-router-dom"
import type { RouteObject } from "react-router-dom"
import { routes, routeSegments } from "@/config/routes"

export const adminRoutes: RouteObject[] = [
  {
    path: routeSegments.app.admin,
    children: [
      {
        index: true,
        element: <Navigate replace to={routes.adminUsers} />,
      },
      {
        path: "users",
        async lazy() {
          const { AdminUsersPage } =
            await import("@/features/admin/pages/admin-users-page")
          return { Component: AdminUsersPage }
        },
      },
      {
        path: "*",
        element: <Navigate replace to={routes.adminUsers} />,
      },
    ],
  },
]
