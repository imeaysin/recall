import type { CSSProperties } from "react"
import { useEffect, useEffectEvent, useRef } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { PlusIcon, SearchIcon, SparklesIcon } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { routes } from "@/config/routes"
import { Button } from "@workspace/ui/components/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { Kbd } from "@workspace/ui/components/kbd"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const query = new URLSearchParams(location.search).get("q") ?? ""
  const isLibraryRoute = location.pathname.startsWith(routes.library)

  const focusSearch = useEffectEvent(() => {
    searchInputRef.current?.focus()
  })

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey) || event.key !== "/") return
      event.preventDefault()
      focusSearch()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  function submitSearch(value: string) {
    const trimmed = value.trim()
    if (isLibraryRoute) {
      const params = new URLSearchParams(location.search)
      if (trimmed) params.set("q", trimmed)
      else params.delete("q")
      navigate({ pathname: location.pathname, search: params.toString() })
      return
    }

    navigate({
      pathname: routes.library,
      search: trimmed ? `?q=${encodeURIComponent(trimmed)}` : undefined,
    })
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": "280px" } as CSSProperties}>
      <AppSidebar />
      <SidebarInset>
        <header className="z-10 flex shrink-0 items-center gap-3 border-b bg-background px-4 py-3 md:px-6">
          <SidebarTrigger className="-ml-1 shrink-0" />
          <InputGroup className="h-10 max-w-2xl flex-1 rounded-full">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              ref={searchInputRef}
              key={`${location.pathname}:${query}`}
              defaultValue={query}
              placeholder="Search your knowledge base"
              aria-label="Search your knowledge base"
              onKeyDown={(event) => {
                if (event.key !== "Enter") return
                submitSearch(event.currentTarget.value)
              }}
            />
            <InputGroupAddon align="inline-end" className="gap-1.5 pr-1.5">
              <Kbd className="hidden sm:inline-flex">Ctrl</Kbd>
              <Kbd className="hidden sm:inline-flex">/</Kbd>
              <InputGroupButton
                nativeButton={false}
                render={<Link to={routes.chat} />}
                className="rounded-full"
              >
                <SparklesIcon data-icon="inline-start" />
                Ask Chat
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <Button
            className="ml-auto shrink-0 rounded-full"
            nativeButton={false}
            render={<Link to={`${routes.library}?add=url`} />}
          >
            <PlusIcon data-icon="inline-start" />
            Add
          </Button>
        </header>
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
