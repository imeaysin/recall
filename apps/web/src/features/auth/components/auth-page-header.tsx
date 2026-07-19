type AuthPageHeaderProps = {
  title: string
  description?: string
}

export function AuthPageHeader({ title, description }: AuthPageHeaderProps) {
  return (
    <div className="space-y-2 text-center">
      <h1 className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
        {title}
      </h1>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
