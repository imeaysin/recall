import type { OrganizationPermissionMap } from "../permissions/organization"

export const authQueryKeys = {
  all: ["auth"] as const,
  accounts: () => [...authQueryKeys.all, "accounts"] as const,
  accountInfo: (accountId?: string) =>
    [...authQueryKeys.all, "account-info", accountId] as const,
  sessions: () => [...authQueryKeys.all, "sessions"] as const,
  passkeys: () => [...authQueryKeys.all, "passkeys"] as const,
  organizations: () => [...authQueryKeys.all, "organizations"] as const,
  activeOrganization: (slug?: string, organizationId?: string | null) =>
    [
      ...authQueryKeys.all,
      "active-organization",
      slug,
      organizationId ?? null,
    ] as const,
  fullOrganization: (organizationId?: string) =>
    [...authQueryKeys.all, "full-organization", organizationId] as const,
  organizationMembers: (organizationId?: string) =>
    [...authQueryKeys.all, "organization-members", organizationId] as const,
  organizationInvitations: (organizationId?: string) =>
    [...authQueryKeys.all, "organization-invitations", organizationId] as const,
  organizationRoles: (organizationId?: string) =>
    [...authQueryKeys.all, "organization-roles", organizationId] as const,
  activeMember: (organizationId?: string) =>
    [...authQueryKeys.all, "active-member", organizationId] as const,
  userInvitations: () => [...authQueryKeys.all, "user-invitations"] as const,
  organizationPermission: (
    organizationId: string,
    permission: OrganizationPermissionMap
  ) =>
    [
      ...authQueryKeys.all,
      "organization-permission",
      organizationId,
      permission,
    ] as const,
  organizationPermissionStatic: (
    organizationId: string,
    memberRole: string,
    permission: OrganizationPermissionMap
  ) =>
    [
      ...authQueryKeys.all,
      "organization-permission-static",
      organizationId,
      memberRole,
      permission,
    ] as const,
} as const
