import type { ReactNode } from "react"

type PageHeaderProps = {
  readonly title: string
  readonly description?: string
  readonly actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-muted-foreground">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-muted-foreground/80">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
    </div>
  )
}
