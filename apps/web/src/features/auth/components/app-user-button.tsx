import { AuthUserButton } from "@workspace/ui/auth"
import { useAppShellConfig } from "@/features/shell/use-app-shell-config"

export function AppUserButton() {
  const { onSignOut } = useAppShellConfig()

  return (
    <AuthUserButton
      className="max-w-[45vw]"
      onSignOut={onSignOut}
      size="compact"
    />
  )
}
