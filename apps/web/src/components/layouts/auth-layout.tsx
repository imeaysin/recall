import { Outlet } from "react-router-dom"
import { AuthShell } from "@/features/auth/components/auth-shell"

export function AuthLayout() {
  return (
    <AuthShell>
      <Outlet />
    </AuthShell>
  )
}
