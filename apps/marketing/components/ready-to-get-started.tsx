"use client"

import { Button } from "@/components/product-ui"
import { homeContent } from "@/content/home"
import { useDetectPlatform } from "hooks/use-detect-platform"
import Link from "next/link"
import { getPlatformIcon } from "@/utils/platform"

export function ReadyToGetStarted() {
  const { platform } = useDetectPlatform()
  const { title, download, pro } = homeContent.readyToGetStarted

  return (
    <div className="mx-auto my-24 w-full max-w-4xl px-5 md:my-32">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-[linear-gradient(180deg,color-mix(in_oklch,var(--muted)_70%,transparent),var(--background))] px-6 py-14 text-center sm:px-10 md:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--foreground)_6%,transparent),transparent)]"
        />
        <div className="relative z-10 mx-auto max-w-lg">
          <h2 className="text-3xl font-medium tracking-tight text-balance text-foreground md:text-4xl">
            {title}
          </h2>
          <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button
              variant="dark"
              href="/download"
              size="lg"
              className="justify-center font-medium"
            >
              {platform ? getPlatformIcon(platform) : null}
              {download}
            </Button>
            <Button
              variant="outline"
              href="/pricing"
              size="lg"
              className="justify-center font-medium"
            >
              {pro}
            </Button>
          </div>
          <p className="mt-5 text-sm text-muted-foreground">
            or{" "}
            <Link
              href="/pricing"
              className="font-medium text-foreground underline underline-offset-4"
            >
              view pricing
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
