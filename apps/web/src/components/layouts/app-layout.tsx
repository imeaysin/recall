import { NavLink, Outlet, useLocation } from "react-router-dom"
import { CreateOrganizationDialog } from "@workspace/ui-shadcn/auth"
import { WorkspaceOnboardingGate } from "@/features/auth/components/workspace-onboarding-gate"
import type { AppOutletContext } from "@/features/auth/app-outlet-context"
import { useCreateOrganizationDialog } from "@/features/auth/hooks/use-create-organization-dialog"
import { useEventStream } from "@/features/notifications/hooks/use-event-stream"
import { useAppShellConfig } from "@/features/shell/use-app-shell-config"
import { AppSidebar } from "@workspace/ui-shadcn/components/app-sidebar"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@workspace/ui-shadcn/components/sidebar"
import { Separator } from "@workspace/ui-shadcn/components/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@workspace/ui-shadcn/components/breadcrumb"

export function AppLayout() {
  const createOrganization = useCreateOrganizationDialog()
  const { navigation, userMenuItems, onSignOut } = useAppShellConfig()
  const { pathname } = useLocation()
  useEventStream()
  const outletContext: AppOutletContext = {
    openCreateOrganization: createOrganization.openDialog,
  }

  return (
    <WorkspaceOnboardingGate>
      <SidebarProvider>
        <AppSidebar
          navigation={navigation}
          onCreateOrganization={createOrganization.openDialog}
          onSignOut={onSignOut}
          userMenuItems={userMenuItems}
          pathname={pathname}
          linkComponent={({ href, children, ...props }) => (
            <NavLink to={href} {...props}>
              {children}
            </NavLink>
          )}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {navigation.find((n) => n.isCurrent?.({ pathname }))
                        ?.name ?? "Dashboard"}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <Outlet context={outletContext} />
          </div>
        </SidebarInset>
      </SidebarProvider>
      <CreateOrganizationDialog {...createOrganization.dialogProps} />
    </WorkspaceOnboardingGate>
  )
}
