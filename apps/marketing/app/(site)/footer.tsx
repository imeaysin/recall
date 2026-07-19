"use client"

import { SiteFooter, type FooterLinkGroup } from "@/components/ui/site-footer"
import { footerNavigation, socialLinks } from "@/config/navigation"
import { siteConfig } from "@/config/site"
import { useTheme } from "@workspace/ui/components/theme-provider"
import { useIsClient } from "@workspace/ui/hooks/use-is-client"
import { MoonIcon, SunIcon } from "lucide-react"

const footerLinkGroups: FooterLinkGroup[] = [
  { title: "Features", links: [...footerNavigation.features] },
  { title: "Product", links: [...footerNavigation.product] },
  {
    title: "Company",
    links: [
      ...footerNavigation.company.map(({ href, label }) => ({ href, label })),
      { href: socialLinks.twitter, label: "X / Twitter", external: true },
      { href: socialLinks.github, label: "GitHub", external: true },
    ],
  },
  {
    title: "Resources",
    links: [
      ...footerNavigation.resources.map(({ href, label }) => ({
        href,
        label,
      })),
      { href: socialLinks.discord, label: "Discord", external: true },
    ],
  },
]

export function Footer() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useIsClient()

  return (
    <SiteFooter
      copyright={`© ${new Date().getFullYear()} ${siteConfig.legalName}. All rights reserved.`}
      linkGroups={footerLinkGroups}
      status={{
        href: socialLinks.status,
        label: "System status:",
        value: "Operational",
      }}
      tagline={siteConfig.tagline}
      wordmark={siteConfig.name.toLowerCase()}
      sidebar={
        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="flex items-center gap-2 border border-border px-3 py-1.5 text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
          aria-label="Toggle theme"
        >
          {mounted ? (
            resolvedTheme === "dark" ? (
              <SunIcon className="size-4" />
            ) : (
              <MoonIcon className="size-4" />
            )
          ) : (
            <div className="size-4" />
          )}
          <span className="font-sans text-sm">
            {mounted
              ? resolvedTheme === "dark"
                ? "Light mode"
                : "Dark mode"
              : "Toggle theme"}
          </span>
        </button>
      }
    />
  )
}
