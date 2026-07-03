import { Navigate } from "react-router-dom"
import type { RouteObject } from "react-router-dom"
import { organizationUiPermissions } from "@workspace/ui/auth"
import { routes, routeSegments } from "@/config/routes"
import { OrganizationPeoplePage } from "@/features/organization/pages/organization-people-page"
import { OrganizationRolesPage } from "@/features/organization/pages/organization-roles-page"
import { OrganizationSettingsPage } from "@/features/organization/pages/organization-settings-page"
import { OrganizationPermissionRoute } from "@/routing/organization-permission-route"

export const organizationRoutes: RouteObject[] = [
  {
    path: routeSegments.app.organization,
    children: [
      {
        index: true,
        element: <Navigate replace to={routes.organizationSettings} />,
      },
      { path: "settings", element: <OrganizationSettingsPage /> },
      { path: "people", element: <OrganizationPeoplePage /> },
      {
        element: (
          <OrganizationPermissionRoute
            permission={organizationUiPermissions.listRoles}
          />
        ),
        children: [{ path: "roles", element: <OrganizationRolesPage /> }],
      },
      {
        path: "*",
        element: <Navigate replace to={routes.organizationSettings} />,
      },
    ],
  },
]
