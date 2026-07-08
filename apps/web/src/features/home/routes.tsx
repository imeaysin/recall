import type { RouteObject } from "react-router-dom"

export const homeRoutes: RouteObject[] = [
  {
    index: true,
    async lazy() {
      const { HomePage } = await import("@/features/home/pages/home-page")
      return { Component: HomePage }
    },
  },
]
