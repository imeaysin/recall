import type React from "react"

export function SidebarLogoMark({
  logo,
}: {
  logo: React.ReactNode
}): React.ReactElement {
  return (
    <span className="flex size-4 shrink-0 items-center justify-center [&>svg]:size-full">
      {logo}
    </span>
  )
}
