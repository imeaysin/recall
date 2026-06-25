import { createBrowserRouter, Link } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { PageNotFound } from "@workspace/ui/components/page-not-found"
import { RootLayout } from "@/components/layouts/root-layout"
import { adminRoutes } from "@/features/admin/routes"
import { authRoutes } from "@/features/auth/routes"
import { dashboardRoutes } from "@/features/dashboard/routes"
import { homeRoutes } from "@/features/home/routes"
import { paths } from "@/config/paths"

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      ...homeRoutes,
      ...authRoutes,
      ...dashboardRoutes,
      ...adminRoutes,
      {
        path: "*",
        element: (
          <PageNotFound
            action={<Button render={<Link to={paths.home} />}>Go home</Button>}
          />
        ),
      },
    ],
  },
])
