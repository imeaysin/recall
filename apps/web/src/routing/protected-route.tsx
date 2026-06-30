import { Navigate, Outlet } from "react-router-dom"
import { PageLoading } from "@workspace/ui/components/page-loading"
import { useAuthSession } from "@workspace/auth/react"
import { routes } from "@/config/routes"

export function ProtectedRoute() {
  const { data: session, isPending } = useAuthSession()

  if (isPending) {
    return <PageLoading />
  }

  if (!session) {
    return <Navigate replace to={routes.signIn} />
  }

  return <Outlet />
}
