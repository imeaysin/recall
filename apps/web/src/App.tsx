import { Button } from "@workspace/ui/components/button"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"

function App() {
  return (
    <ThemeProvider>
      <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Web App</h1>
        <p className="text-muted-foreground text-center text-sm">
          Shared UI from <code>@workspace/ui</code>
        </p>
        <Button>Get started</Button>
      </main>
    </ThemeProvider>
  )
}

export default App
