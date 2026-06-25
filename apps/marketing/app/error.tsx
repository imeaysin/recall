"use client"

import { PageError } from "@workspace/ui/components/page-error"

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <PageError onRetry={reset} />
}
