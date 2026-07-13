import type { ReactNode } from "react"
import { Card, CardContent } from "@workspace/ui-shadcn/components/card"
import { cn } from "@workspace/ui-shadcn/lib/utils"

interface LinkCardProps {
  href: string
  children: ReactNode
  className?: string
  panelClassName?: string
  external?: boolean
}

export function LinkCard({
  href,
  children,
  className,
  panelClassName,
  external = false,
}: LinkCardProps) {
  return (
    <a
      href={href}
      rel={external ? "noopener noreferrer" : undefined}
      target={external ? "_blank" : undefined}
      className="block"
    >
      <Card
        className={cn(
          "rounded-none shadow-none transition-colors before:hidden hover:border-foreground/20 hover:bg-secondary/50",
          className
        )}
      >
        <CardContent className={cn("p-0", panelClassName)}>
          {children}
        </CardContent>
      </Card>
    </a>
  )
}
