import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { PageNotFound } from "@workspace/ui/components/page-not-found"

export default function NotFound() {
  return (
    <PageNotFound
      action={<Button render={<Link href="/" />}>Go home</Button>}
    />
  )
}
