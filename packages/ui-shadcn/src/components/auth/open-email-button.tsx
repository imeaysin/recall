"use client"

import { SquareArrowOutUpRight } from "lucide-react"
import { getEmailProviderLink } from "@workspace/auth/react"
import { Button } from "@workspace/ui-shadcn/components/button"
import { cn } from "@workspace/ui-shadcn/lib/utils"

export type OpenEmailButtonProps = {
  email: string
  label?: string
  className?: string
}

export function OpenEmailButton({
  email,
  label,
  className,
}: OpenEmailButtonProps) {
  const provider = getEmailProviderLink(email)
  if (!provider) return null

  const buttonLabel = label ?? `Open ${provider.providerName}`

  return (
    <Button
      asChild
      className={cn("w-full", className)}
      size="lg"
      variant="outline"
    >
      <a href={provider.loginUrl} rel="noopener noreferrer" target="_blank">
        {buttonLabel}
        <SquareArrowOutUpRight aria-hidden="true" />
      </a>
    </Button>
  )
}
