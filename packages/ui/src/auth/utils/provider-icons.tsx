import type { ComponentType } from "react"
import { FaGithub, FaGoogle } from "react-icons/fa"
import { Plug } from "lucide-react"

export const providerIcons: Record<
  string,
  ComponentType<{ className?: string }>
> = {
  google: FaGoogle,
  github: FaGithub,
}

export function getProviderName(provider: string): string {
  if (provider === "google") return "Google"
  if (provider === "github") return "GitHub"
  return provider.charAt(0).toUpperCase() + provider.slice(1)
}

export const DefaultProviderIcon = Plug
