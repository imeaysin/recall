import type { ReactNode } from "react"

type AuthPageBodyProps = {
  children: ReactNode
  footer?: ReactNode
}

export function AuthPageBody({ children, footer }: AuthPageBodyProps) {
  return (
    <div className="space-y-6">
      {children}
      {footer ? (
        <div className="text-center text-sm text-muted-foreground">
          {footer}
        </div>
      ) : null}
    </div>
  )
}
