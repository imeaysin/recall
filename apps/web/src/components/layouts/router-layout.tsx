import { Outlet } from "react-router-dom"
import { AuthUiConfigBridge } from "@/features/auth/components/auth-ui-config-bridge"

export function RouterLayout() {
  return (
    <AuthUiConfigBridge>
      <Outlet />
    </AuthUiConfigBridge>
  )
}
