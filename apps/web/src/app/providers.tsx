import { QueryClientProvider } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"
import { AppProviders } from "@workspace/ui/providers/app-providers"
import { AppErrorBoundary } from "@workspace/ui/providers/app-error-boundary"
import { createQueryClient } from "@/lib/query-client"

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <AppProviders>
        <AppErrorBoundary>{children}</AppErrorBoundary>
      </AppProviders>
    </QueryClientProvider>
  )
}
