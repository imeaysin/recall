import { Link } from "react-router-dom"
import { useSession, signOut } from "@workspace/auth/client"
import { Button } from "@workspace/ui-shadcn/components/button"
import { routes } from "@/config/routes"
import { site } from "@/config/site"

export function Navbar() {
  const { data: session, isPending } = useSession()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          className="font-heading text-sm font-semibold tracking-tight"
          to={routes.home}
        >
          {site.name}
        </Link>
        <div className="flex items-center gap-2">
          {isPending ? null : session ? (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link to={routes.dashboard}>App</Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  void signOut()
                }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link to={routes.signIn}>Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to={routes.signUp}>Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
