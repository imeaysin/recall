import { Button } from "@workspace/ui/components/button"

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Marketing</h1>
      <p className="text-center text-sm text-muted-foreground">
        Shared UI from <code>@workspace/ui</code>
      </p>
      <Button>Get started</Button>
    </main>
  )
}
