import { QueryClientProvider } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"
import { Toaster } from "@workspace/ui-shadcn/components/sonner"
import { ThemeProvider } from "@workspace/ui-shadcn/components/theme-provider"
import { TooltipProvider } from "@workspace/ui-shadcn/components/tooltip"
import { createQueryClient } from "@/lib/query-client"
import { AppErrorBoundary } from "./app-error-boundary"

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient)

  return (
    <ThemeProvider defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppErrorBoundary>{children}</AppErrorBoundary>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
