import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { SettingsIcon } from "lucide-react"
import { flattenNavItems } from "@workspace/ui/components/shell"
import type { CommandAction } from "@workspace/ui/components/shell"
import type { AuthUserButtonMenuItem } from "@workspace/ui/auth"
import { appNavigation, adminNavigationItem } from "@/config/app-navigation"
import { routes } from "@/config/routes"
import { site } from "@/config/site"
import { usePlatformPermission, useSignOut } from "@workspace/auth/react"
import { platformUiPermissions } from "@workspace/ui/auth"

export function useAppShellConfig() {
  const navigate = useNavigate()
  const signOut = useSignOut()
  const { data: adminPermission } = usePlatformPermission(
    platformUiPermissions.listUsers
  )

  const navigation = useMemo(() => {
    if (!adminPermission?.success) return appNavigation
    return [...appNavigation, adminNavigationItem]
  }, [adminPermission?.success])

  const userMenuItems = useMemo<AuthUserButtonMenuItem[]>(
    () => [
      {
        label: "Account settings",
        href: routes.settingsAccount,
        icon: SettingsIcon,
      },
    ],
    []
  )

  const commandActions = useMemo<CommandAction[]>(() => {
    return flattenNavItems(navigation).map((item) => ({
      id: item.href || item.name,
      name: item.name,
      section: "Navigation",
      keywords: item.name,
      href: item.href || undefined,
      onSelect: item.href ? () => navigate(item.href) : undefined,
    }))
  }, [navigate, navigation])

  return {
    brandLabel: site.name,
    commandActions,
    navigation,
    onSignOut: () => signOut.mutate(),
    userMenuItems,
  }
}
