import { createBrowserRouter, Link, Navigate, Outlet } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { PageNotFound } from "@/components/page-not-found"
import { AppLayout } from "@/components/layouts/app-layout"
import { AuthLayout } from "@/components/layouts/auth-layout"
import { RootLayout } from "@/components/layouts/root-layout"
import { BetterAuthUiProvider } from "@/features/auth/providers/better-auth-ui-provider"
import { authRoutes } from "@/features/auth/routes"
import { dashboardRoutes } from "@/features/dashboard/routes"
import { libraryRoutes } from "@/features/library/routes"
import { chatRoutes } from "@/features/chat/routes"
import { topicsRoutes } from "@/features/topics/routes"
import { uploadsRoutes } from "@/features/uploads/routes"
import { settingsRoutes } from "@/features/settings/routes"
import { homeRoutes } from "@/features/home/routes"
import { ProtectedRoute } from "@/routing/protected-route"
import { routeSegments, routes } from "@/config/routes"

function AuthUiLayout() {
  return (
    <BetterAuthUiProvider>
      <Outlet />
    </BetterAuthUiProvider>
  )
}

export const router = createBrowserRouter([
  {
    element: <AuthUiLayout />,
    children: [
      {
        element: <RootLayout />,
        children: homeRoutes,
      },
      {
        path: routeSegments.auth.root,
        element: <AuthLayout />,
        children: authRoutes,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                path: routeSegments.app.root,
                children: [
                  {
                    index: true,
                    element: (
                      <Navigate replace to={routeSegments.app.library} />
                    ),
                  },
                  ...dashboardRoutes,
                  ...libraryRoutes,
                  ...chatRoutes,
                  ...topicsRoutes,
                  ...uploadsRoutes,
                  ...settingsRoutes,
                ],
              },
            ],
          },
        ],
      },
      {
        path: "*",
        element: (
          <PageNotFound
            action={
              <Button nativeButton={false} render={<Link to={routes.home} />}>
                Go home
              </Button>
            }
          />
        ),
      },
    ],
  },
])
