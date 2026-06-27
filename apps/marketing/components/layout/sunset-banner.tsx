import Link from "next/link"
import { SunsetBanner as SunsetBannerBase } from "@workspace/ui/auth"

export function SunsetBanner() {
  return (
    <SunsetBannerBase
      action={
        <Link
          className="underline underline-offset-2 transition-colors hover:text-foreground/80"
          href="#features"
        >
          Read more
        </Link>
      }
    />
  )
}
