import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { routes } from "@/config/routes"
import { site } from "@/config/site"
import { AuthTermsFooter } from "@/features/auth/components/auth-terms-footer"

type AuthShellProps = {
  children: ReactNode
}

/** Full-page auth frame: logo, centered form column, terms. No side panel. */
export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-svh flex-col bg-background">
      <header className="fixed inset-x-0 top-0 z-50">
        <nav className="flex items-center px-4 py-3 md:px-6">
          <Link
            to={routes.home}
            className="text-base font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
          >
            {site.name}
          </Link>
        </nav>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center p-6 pb-2 sm:p-8">
        <div className="flex w-full max-w-md flex-1 flex-col pt-16 sm:min-h-[calc(100svh-5rem)] sm:pt-20">
          <div className="flex flex-1 flex-col justify-center space-y-8 py-8">
            {children}
          </div>
          <AuthTermsFooter
            privacyHref={site.links.privacy}
            termsHref={site.links.terms}
          />
        </div>
      </div>
    </div>
  )
}
