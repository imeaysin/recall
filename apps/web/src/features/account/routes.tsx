import { Navigate } from "react-router-dom"
import type { RouteObject } from "react-router-dom"
import { routes } from "@/config/routes"
import { routeSegments } from "@/config/routes"

export const accountRoutes: RouteObject[] = [
  {
    path: routeSegments.app.settings,
    children: [
      {
        index: true,
        element: <Navigate replace to={routes.settingsAccount} />,
      },
      {
        path: "account",
        async lazy() {
          const { AccountSettingsPage } =
            await import("@/features/account/pages/account-settings-page")
          return { Component: AccountSettingsPage }
        },
      },
      {
        path: "security",
        async lazy() {
          const { SecuritySettingsPage } =
            await import("@/features/account/pages/security-settings-page")
          return { Component: SecuritySettingsPage }
        },
      },
      {
        path: "*",
        element: <Navigate replace to={routes.settingsAccount} />,
      },
    ],
  },
]
