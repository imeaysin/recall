import { Navigate, useParams } from "react-router-dom"
import { ShellMain } from "@workspace/ui/components/shell"
import { Settings, type SettingsView } from "@workspace/ui/auth"
import { routes } from "@/config/routes"

function isSettingsView(value: string | undefined): value is SettingsView {
  return value === "account" || value === "security"
}

export function SettingsPage() {
  const { section } = useParams<{ section?: string }>()

  if (!section) {
    return <Navigate replace to={routes.settingsAccount} />
  }

  if (!isSettingsView(section)) {
    return <Navigate replace to={routes.settingsAccount} />
  }

  return (
    <ShellMain heading="Account" subtitle="Manage your account settings.">
      <div className="max-w-2xl">
        <Settings view={section} />
      </div>
    </ShellMain>
  )
}
