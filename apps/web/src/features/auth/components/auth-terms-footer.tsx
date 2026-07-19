type AuthTermsFooterProps = {
  termsHref?: string
  privacyHref?: string
}

export function AuthTermsFooter({
  termsHref = "/terms",
  privacyHref = "/privacy",
}: AuthTermsFooterProps) {
  return (
    <p className="mt-auto py-6 text-center text-xs text-muted-foreground">
      By signing in you agree to our{" "}
      <a
        className="underline underline-offset-2 transition-colors hover:text-foreground"
        href={termsHref}
        rel="noreferrer"
        target="_blank"
      >
        Terms of service
      </a>{" "}
      &amp;{" "}
      <a
        className="underline underline-offset-2 transition-colors hover:text-foreground"
        href={privacyHref}
        rel="noreferrer"
        target="_blank"
      >
        Privacy policy
      </a>
    </p>
  )
}
