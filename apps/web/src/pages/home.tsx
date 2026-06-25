import { Button } from "@workspace/ui/components/button"

export function HomePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Web App</h1>
      <p className="text-center text-sm text-muted-foreground">
        Shared UI from <code>@workspace/ui</code>
      </p>
      <Button>Get started</Button>
    </main>
  )
}
