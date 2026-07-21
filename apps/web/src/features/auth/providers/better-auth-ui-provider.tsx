import "@/lib/auth/auth-plugin"
import { authClient } from "@workspace/auth/client"
import { useTheme } from "@workspace/ui/components/theme-provider"
import { useQueryClient } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthProvider } from "@/features/auth/components/auth-provider"
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"
import { deleteUserPlugin } from "@/lib/auth/delete-user-plugin"
import { themePlugin } from "@/lib/auth/theme-plugin"
import { defaultAuthenticatedRoute, routes } from "@/config/routes"

/** Better Auth UI context wired to the app auth client and React Router. */
export function BetterAuthUiProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return (
    <AuthProvider
      authClient={authClient}
      queryClient={queryClient}
      redirectTo={defaultAuthenticatedRoute}
      basePaths={{
        auth: "/auth",
        settings: routes.settings,
      }}
      emailAndPassword={{
        enabled: false,
      }}
      socialProviders={["google", "github"]}
      navigate={({ to, replace }) => {
        void navigate(to, { replace })
      }}
      Link={({ href, to, ...props }) => (
        <Link to={href ?? to ?? "/"} {...props} />
      )}
      plugins={[
        apiKeyPlugin({ organization: false }),
        themePlugin({ useTheme }),
        deleteUserPlugin(),
      ]}
    >
      {children}
    </AuthProvider>
  )
}
