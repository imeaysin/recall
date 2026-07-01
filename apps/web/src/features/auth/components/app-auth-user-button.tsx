import {
  AuthUserButton,
  type AuthUserButtonMenuItem,
  type AuthUserButtonProps,
} from "@workspace/ui/auth"
import { useAppShellConfig } from "@/features/shell/use-app-shell-config"

type AppAuthUserButtonProps = Pick<
  AuthUserButtonProps,
  "className" | "hideSettings" | "onCreateOrganization" | "size"
> & {
  menuItems?: AuthUserButtonMenuItem[]
}

function AppAuthUserButton({
  className,
  hideSettings,
  menuItems,
  onCreateOrganization,
  size,
}: AppAuthUserButtonProps) {
  const { onSignOut } = useAppShellConfig()

  return (
    <AuthUserButton
      className={className}
      hideSettings={hideSettings}
      menuItems={menuItems}
      onCreateOrganization={onCreateOrganization}
      onSignOut={onSignOut}
      showWorkspaceMenu
      size={size}
    />
  )
}

export function AppUserButton({
  onCreateOrganization,
}: {
  onCreateOrganization: () => void
}) {
  return (
    <AppAuthUserButton
      className="max-w-[45vw]"
      onCreateOrganization={onCreateOrganization}
      size="compact"
    />
  )
}

export function AppSidebarUser({
  onCreateOrganization,
}: {
  onCreateOrganization: () => void
}) {
  const { userMenuItems } = useAppShellConfig()

  return (
    <AppAuthUserButton
      hideSettings
      menuItems={userMenuItems}
      onCreateOrganization={onCreateOrganization}
      size="sidebar"
    />
  )
}
