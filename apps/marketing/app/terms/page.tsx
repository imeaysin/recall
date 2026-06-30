import Link from "next/link"
import { site } from "@/config/site"

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← {site.name}
      </Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        Terms of Service
      </h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        Replace this placeholder with your terms of service before production.
      </p>
    </div>
  )
}
