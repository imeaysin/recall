import Link from "next/link"
import type { ReactNode } from "react"

export function SunsetBanner({ action }: { action?: ReactNode }) {
  return (
    <div className="bg-primary px-4 py-3 text-primary-foreground sm:flex sm:items-center sm:justify-center sm:px-6 lg:px-8">
      <p className="text-center text-sm font-medium sm:text-left">
        We are transitioning to a new platform.
        <span className="hidden md:inline"> &nbsp;</span>
        <span className="block sm:ml-2 sm:inline-block">
          {action || (
            <Link
              className="underline underline-offset-2 transition-colors hover:text-primary-foreground/80"
              href="#features"
            >
              Read more
            </Link>
          )}
        </span>
      </p>
    </div>
  )
}
