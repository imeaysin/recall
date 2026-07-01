import type { GenericEndpointContext, Session } from "better-auth"
import { getOrgAdapter } from "better-auth/plugins/organization"
import { organizationPluginOptions } from "../config/organization-plugin"

function sanitizeOrganizationSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function buildDefaultOrganization(user: { id: string; name: string }) {
  const label = user.name?.trim() || "My"
  const base = sanitizeOrganizationSlug(label) || "workspace"

  return {
    name: `${label}'s Workspace`,
    slug: `${base}-${user.id.slice(0, 8)}`,
  }
}

function getOrganizationAdapter(context: GenericEndpointContext) {
  return getOrgAdapter(context.context, organizationPluginOptions)
}

export async function ensureDefaultOrganization(
  context: GenericEndpointContext | null,
  user: { id: string; name: string }
) {
  if (!context) {
    return null
  }

  const adapter = getOrganizationAdapter(context)
  const organizations = await adapter.listOrganizations(user.id)

  if (organizations.length > 0) {
    return organizations[0]?.id ?? null
  }

  const { name, slug } = buildDefaultOrganization(user)
  const organization = await adapter.createOrganization({
    organization: {
      name,
      slug,
      createdAt: new Date(),
    },
  })

  await adapter.createMember({
    userId: user.id,
    organizationId: organization.id,
    role: "owner",
  })

  return organization.id
}

export async function ensureSessionActiveOrganization(
  context: GenericEndpointContext | null,
  session: Session & Record<string, unknown>
): Promise<{ data: Session & Record<string, unknown> }> {
  if (session.activeOrganizationId) {
    return { data: session }
  }

  if (!context) {
    return { data: session }
  }

  const user = await context.context.internalAdapter.findUserById(
    session.userId
  )

  if (!user) {
    return { data: session }
  }

  const organizationId = await ensureDefaultOrganization(context, {
    id: user.id,
    name: user.name,
  })

  if (!organizationId) {
    return { data: session }
  }

  return {
    data: {
      ...session,
      activeOrganizationId: organizationId,
    },
  }
}
