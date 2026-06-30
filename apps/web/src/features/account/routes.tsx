import type { RouteObject } from "react-router-dom"
import { SettingsPage } from "@/features/account/pages/settings-page"
import { routeSegments } from "@/config/routes"

export const accountRoutes: RouteObject[] = [
  {
    path: routeSegments.app.settings,
    children: [
      { index: true, element: <SettingsPage /> },
      { path: ":section", element: <SettingsPage /> },
    ],
  },
]
