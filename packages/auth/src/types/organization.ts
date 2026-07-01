import type {
  InferInvitation,
  InferMember,
  InferOrganization,
} from "better-auth/plugins/organization"
import type { AuthClient } from "../lib/auth-client"
import type { organizationPluginOptions } from "../config/organization-plugin"

type OrganizationPluginConfig = typeof organizationPluginOptions

export type Organization = InferOrganization<OrganizationPluginConfig>
export type OrganizationMember = InferMember<OrganizationPluginConfig>
export type OrganizationInvitation = InferInvitation<OrganizationPluginConfig>

export type ActiveOrganization = Organization & {
  members: OrganizationMember[]
  invitations: OrganizationInvitation[]
}

export type OrganizationSummary = Partial<
  Pick<Organization, "id" | "name" | "slug" | "logo">
>

type ListOrganizationRolesData = NonNullable<
  Awaited<ReturnType<AuthClient["organization"]["listRoles"]>>["data"]
>

export type OrganizationRole = ListOrganizationRolesData[number]

export type CreateOrganizationRoleInput = Parameters<
  AuthClient["organization"]["createRole"]
>[0]

export type UpdateOrganizationRoleInput = Parameters<
  AuthClient["organization"]["updateRole"]
>[0]

export type DeleteOrganizationRoleInput = Parameters<
  AuthClient["organization"]["deleteRole"]
>[0]
