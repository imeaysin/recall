import { AppSidebar } from "@/components/app-sidebar"
import { useEventStream } from "@/features/notifications/hooks/use-event-stream"
import { useAppShellConfig } from "@/features/shell/use-app-shell-config"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui-shadcn/components/breadcrumb"
import { Separator } from "@workspace/ui-shadcn/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui-shadcn/components/sidebar"
import { Outlet, useLocation } from "react-router-dom"

export const AppLayout = () => {
  const { navMain, brandLabel } = useAppShellConfig()
  const { pathname } = useLocation()
  useEventStream()

  const currentNav = navMain.find(
    (n) =>
      pathname === n.url ||
      n.items?.some(
        (sub) => pathname === sub.url || pathname.startsWith(`${sub.url}/`)
      )
  )
  const currentSubNav = currentNav?.items?.find(
    (n) => pathname === n.url || pathname.startsWith(`${n.url}/`)
  )
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    {currentNav?.title ?? brandLabel}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {currentSubNav && (
                  <>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{currentSubNav.title}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-6 pt-0">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
