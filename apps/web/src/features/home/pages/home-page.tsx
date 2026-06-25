import { Link } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { paths } from "@/config/paths"
import { site } from "@/config/site"

export function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold tracking-tight">{site.name}</h1>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        Shared UI from <code>@workspace/ui</code>
      </p>
      <Button render={<Link to={paths.home} />}>Get started</Button>
    </main>
  )
}
