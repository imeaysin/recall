import Link from "next/link"
import { site } from "@/config/site"

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← {site.name}
      </Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        Privacy Policy
      </h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        Replace this placeholder with your privacy policy before production. The
        template ships minimal legal pages so marketing routes match links from
        the web app.
      </p>
    </div>
  )
}
