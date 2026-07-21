import type { RouteObject } from "react-router-dom"
import { routeSegments } from "@/config/routes"
import { TopicsPage } from "./pages/topics-page"

export const topicsRoutes: RouteObject[] = [
  {
    path: routeSegments.app.topics,
    element: <TopicsPage />,
  },
]
