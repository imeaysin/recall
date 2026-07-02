import { Link } from "react-router-dom"
import { ShellMain } from "@workspace/ui/components/shell"
import { Button } from "@workspace/ui/components/button"
import { useAuthSession } from "@workspace/auth/react"
import { routes } from "@/config/routes"

export function DashboardPage() {
  const { data: session } = useAuthSession()
  const name = session?.user.name

  return (
    <ShellMain
      header={{
        heading: "Overview",
        subtitle: name ? `Welcome back, ${name}.` : "Welcome back.",
      }}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        This dashboard is a starting point. See the Notes example for a full
        CRUD feature wired to the API.
      </p>
      <Button render={<Link to={routes.notes} />} variant="outline">
        Open notes
      </Button>
    </ShellMain>
  )
}
