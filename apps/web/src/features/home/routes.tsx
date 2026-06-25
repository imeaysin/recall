import type { RouteObject } from "react-router-dom"
import { HomePage } from "@/features/home/pages/home-page"

export const homeRoutes: RouteObject[] = [
  {
    index: true,
    element: <HomePage />,
  },
]
