import type { ReactNode } from "react"
import { cn } from "@workspace/ui/lib/utils"

type PageShellProps = {
  readonly children: ReactNode
  readonly className?: string
}

/**
 * Shared app page frame — full-width column aligned with the shell chrome.
 * Do not center/narrow the page here; constrain readable content inside the page.
 */
export function PageShell({ children, className }: PageShellProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-6 overflow-auto p-4 md:p-6",
        className
      )}
    >
      {children}
    </div>
  )
}
