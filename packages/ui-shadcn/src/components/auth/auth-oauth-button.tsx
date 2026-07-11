"use client"

import type { ReactNode } from "react"
import { Icons } from "@workspace/ui-shadcn/components/icons"
import { Button } from "@workspace/ui-shadcn/components/button"
import { Spinner } from "@workspace/ui-shadcn/components/spinner"
import { cn } from "@workspace/ui-shadcn/lib/utils"

export type AuthOAuthProvider = "google" | "github"

const providerConfig: Record<
  AuthOAuthProvider,
  { label: string; icon: (props: { className?: string }) => ReactNode }
> = {
  google: {
    label: "Google",
    icon: Icons.Google,
  },
  github: {
    label: "GitHub",
    icon: Icons.Github,
  },
}

export type AuthOAuthButtonProps = {
  provider: AuthOAuthProvider
  onClick: () => void
  loading?: boolean
  disabled?: boolean
  primary?: boolean
  className?: string
}

export function AuthOAuthButton({
  provider,
  onClick,
  loading = false,
  disabled = false,
  primary = false,
  className,
}: AuthOAuthButtonProps) {
  const config = providerConfig[provider]
  const Icon = config.icon

  return (
    <Button
      className={cn("w-full", className)}
      disabled={disabled || loading}
      onClick={onClick}
      size="lg"
      type="button"
      variant={primary ? "default" : "outline"}
    >
      {loading ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <Icon className="size-4" data-icon="inline-start" />
      )}
      Continue with {config.label}
    </Button>
  )
}
