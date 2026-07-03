import { Navigate } from "react-router-dom"
import type { RouteObject } from "react-router-dom"
import { routes, routeSegments } from "@/config/routes"
import { AdminUsersPage } from "@/features/admin/pages/admin-users-page"

export const adminRoutes: RouteObject[] = [
  {
    path: routeSegments.app.admin,
    children: [
      {
        index: true,
        element: <Navigate replace to={routes.adminUsers} />,
      },
      { path: "users", element: <AdminUsersPage /> },
      {
        path: "*",
        element: <Navigate replace to={routes.adminUsers} />,
      },
    ],
  },
]
