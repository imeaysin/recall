import { cn } from "@workspace/ui/lib/utils"
import type { ReactNode } from "react"

export type FooterLink = {
  href: string
  label: string
  external?: boolean
}

export type FooterLinkGroup = {
  title: string
  links: FooterLink[]
}

export type SiteFooterStatus = {
  href: string
  label: string
  value: string
}

export type SiteFooterProps = {
  copyright: string
  linkGroups: FooterLinkGroup[]
  tagline: string
  wordmark: string
  status?: SiteFooterStatus
  sidebar?: ReactNode
  className?: string
}

function FooterNavLink({ href, label, external }: FooterLink) {
  return (
    <a
      href={href}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : undefined)}
      className="block font-sans text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {label}
    </a>
  )
}

export function SiteFooter({
  copyright,
  linkGroups,
  tagline,
  wordmark,
  status,
  sidebar,
  className,
}: SiteFooterProps) {
  return (
    <footer className={cn("relative overflow-hidden bg-background", className)}>
      <div className="h-px w-full border-t border-border" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 py-16 sm:px-8 sm:pb-80">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div
            className={cn(
              "grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-12",
              linkGroups.length >= 4 && "md:grid-cols-4"
            )}
          >
            {linkGroups.map((group) => (
              <div key={group.title} className="space-y-3">
                <h3 className="mb-4 font-sans text-sm text-foreground">
                  {group.title}
                </h3>
                <div className="space-y-2.5">
                  {group.links.map((link) => (
                    <FooterNavLink
                      key={`${link.href}:${link.label}`}
                      {...link}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-start gap-6 lg:items-end lg:gap-10">
            <p className="text-left font-sans text-base text-foreground sm:text-xl lg:text-right">
              {tagline}
            </p>
            {sidebar ? (
              <div className="flex flex-col items-start gap-6 lg:items-end">
                {sidebar}
              </div>
            ) : null}
          </div>
        </div>

        <div className="my-16">
          <div className="h-px w-full border-t border-border" />
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {status ? (
            <a
              href={status.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 transition-opacity hover:opacity-80 md:flex"
            >
              <span className="font-sans text-sm text-muted-foreground">
                {status.label}
              </span>
              <span className="font-sans text-sm text-foreground">
                {status.value}
              </span>
              <span className="relative flex size-2 items-center justify-center">
                <span className="relative z-10 size-2 rounded-full bg-emerald-500" />
                <span className="absolute size-2 animate-ping rounded-full bg-emerald-500/70" />
              </span>
            </a>
          ) : (
            <span />
          )}
          <p className="font-sans text-sm text-muted-foreground">{copyright}</p>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 translate-y-[25%] overflow-hidden bg-background select-none sm:left-1/2 sm:-translate-x-1/2 sm:translate-y-[40%]"
      >
        <p
          className="font-sans text-[200px] leading-none text-secondary sm:text-[508px]"
          style={{
            WebkitTextStroke: "1px var(--border)",
          }}
        >
          {wordmark}
        </p>
      </div>
    </footer>
  )
}
