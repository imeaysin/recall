"use client"

import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"
import { authClient, type AuthClient } from "../lib/auth-client"
import type { ActiveOrganization } from "../types/organization"
import { useAuthUiConfig } from "./auth-ui-config"
import {
  checkOrganizationPermissionMap,
  createOrganizationPermissionResult,
  formatOrganizationRoleLabel,
  resolveAssignableOrganizationRoles,
  type OrganizationPermissionCheck,
} from "../permissions/organization"
import { authQueryKeys } from "./query-keys"
import { useAuthSession } from "./use-auth-session"
import { unwrapClientResult } from "./utils/client-call"

function useAuthenticatedQueryEnabled(client: AuthClient = authClient) {
  const { data: session, isPending } = useAuthSession(client)
  return { enabled: !isPending && !!session, session }
}

export { useAuthSession } from "./use-auth-session"

export function useSession(client: AuthClient = authClient) {
  return useAuthSession(client)
}

export function useUser(client: AuthClient = authClient) {
  const sessionState = useAuthSession(client)
  return {
    data: sessionState.data?.user ?? null,
    isPending: sessionState.isPending,
  }
}

export function useAuthenticate(options?: {
  redirectTo?: string
  enabled?: boolean
  client?: AuthClient
}) {
  const config = useAuthUiConfig()
  const client = options?.client ?? authClient
  const { data: session, isPending } = useAuthSession(client)
  const redirectTo = options?.redirectTo ?? config.routes.signIn
  const enabled = options?.enabled ?? true

  useEffect(() => {
    if (!enabled || isPending || session) return
    config.navigate(redirectTo, { replace: true })
  }, [enabled, isPending, session, redirectTo, config])
}

export function useListAccounts(client: AuthClient = authClient) {
  const { enabled } = useAuthenticatedQueryEnabled(client)
  return useQuery({
    queryKey: authQueryKeys.accounts(),
    enabled,
    queryFn: () => unwrapClientResult(client.listAccounts()),
  })
}

export function useAccountInfo(
  accountId?: string,
  client: AuthClient = authClient
) {
  const { enabled: sessionEnabled } = useAuthenticatedQueryEnabled(client)
  return useQuery({
    queryKey: authQueryKeys.accountInfo(accountId),
    enabled: sessionEnabled && !!accountId,
    queryFn: () =>
      unwrapClientResult(
        client.accountInfo({ query: { accountId: accountId! } })
      ),
  })
}

export function useListSessions(client: AuthClient = authClient) {
  const { enabled } = useAuthenticatedQueryEnabled(client)
  return useQuery({
    queryKey: authQueryKeys.sessions(),
    enabled,
    queryFn: () => unwrapClientResult(client.listSessions()),
  })
}

export function useListDeviceSessions(client: AuthClient = authClient) {
  const { enabled } = useAuthenticatedQueryEnabled(client)
  return useQuery({
    queryKey: authQueryKeys.deviceSessions(),
    enabled,
    queryFn: async () => {
      const listDeviceSessions = (
        client as AuthClient & {
          listDeviceSessions?: () => ReturnType<AuthClient["listSessions"]>
        }
      ).listDeviceSessions
      if (!listDeviceSessions) return []
      return unwrapClientResult(listDeviceSessions.call(client))
    },
  })
}

export function useListPasskeys(client: AuthClient = authClient) {
  const { enabled } = useAuthenticatedQueryEnabled(client)
  return useQuery({
    queryKey: authQueryKeys.passkeys(),
    enabled,
    queryFn: async () => {
      const listPasskeys = client.passkey?.listUserPasskeys
      if (!listPasskeys) return []
      return unwrapClientResult(listPasskeys.call(client.passkey))
    },
  })
}

export function useListApiKeys(client: AuthClient = authClient) {
  const { enabled } = useAuthenticatedQueryEnabled(client)
  return useQuery({
    queryKey: authQueryKeys.apiKeys(),
    enabled,
    queryFn: async () => {
      const listApiKeys = (
        client as AuthClient & {
          apiKey?: { list: () => ReturnType<AuthClient["listSessions"]> }
        }
      ).apiKey?.list
      if (!listApiKeys) return []
      return unwrapClientResult(listApiKeys())
    },
  })
}

export function useActiveOrganization(
  slug?: string,
  client: AuthClient = authClient
) {
  const { enabled } = useAuthenticatedQueryEnabled(client)
  return useQuery<ActiveOrganization | null>({
    queryKey: authQueryKeys.activeOrganization(slug),
    enabled,
    queryFn: async () => {
      const { data: session } = client.useSession.get()
      let organizationId = session?.session.activeOrganizationId

      if (slug) {
        const organizations = await unwrapClientResult(
          client.organization.list()
        )
        organizationId =
          organizations?.find(
            (organization: { slug?: string }) => organization.slug === slug
          )?.id ?? undefined
      }

      if (!organizationId) return null

      return unwrapClientResult(
        client.organization.getFullOrganization({
          query: { organizationId },
        })
      )
    },
  })
}

export function useFullOrganization(
  organizationId?: string,
  client: AuthClient = authClient
) {
  const { enabled } = useAuthenticatedQueryEnabled(client)
  return useQuery<ActiveOrganization | null>({
    queryKey: authQueryKeys.fullOrganization(organizationId),
    enabled: enabled && !!organizationId,
    queryFn: () =>
      unwrapClientResult(
        client.organization.getFullOrganization({
          query: { organizationId: organizationId! },
        })
      ),
  })
}

export function useListOrganizations(client: AuthClient = authClient) {
  const { enabled } = useAuthenticatedQueryEnabled(client)
  return useQuery({
    queryKey: authQueryKeys.organizations(),
    enabled,
    queryFn: () => unwrapClientResult(client.organization.list()),
  })
}

function resolveActiveOrganizationId(
  organizationId: string | undefined,
  session: ReturnType<typeof useAuthSession>["data"]
) {
  return organizationId ?? session?.session.activeOrganizationId ?? undefined
}

export function useActiveMember(client: AuthClient = authClient) {
  const { enabled, session } = useAuthenticatedQueryEnabled(client)
  const organizationId = resolveActiveOrganizationId(undefined, session)

  return useQuery({
    queryKey: authQueryKeys.activeMember(organizationId),
    enabled: enabled && !!organizationId,
    queryFn: () => unwrapClientResult(client.organization.getActiveMember()),
  })
}

export function useListOrganizationMembers(
  organizationId?: string,
  client: AuthClient = authClient
) {
  const { enabled, session } = useAuthenticatedQueryEnabled(client)
  const resolvedOrganizationId = resolveActiveOrganizationId(
    organizationId,
    session
  )

  return useQuery({
    queryKey: authQueryKeys.organizationMembers(resolvedOrganizationId),
    enabled: enabled && !!resolvedOrganizationId,
    queryFn: () =>
      unwrapClientResult(
        client.organization.listMembers(
          organizationId ? { query: { organizationId } } : undefined
        )
      ),
  })
}

export function useListOrganizationInvitations(
  organizationId?: string,
  client: AuthClient = authClient
) {
  const { enabled, session } = useAuthenticatedQueryEnabled(client)
  const resolvedOrganizationId = resolveActiveOrganizationId(
    organizationId,
    session
  )

  return useQuery({
    queryKey: authQueryKeys.organizationInvitations(resolvedOrganizationId),
    enabled: enabled && !!resolvedOrganizationId,
    queryFn: () =>
      unwrapClientResult(
        client.organization.listInvitations(
          organizationId ? { query: { organizationId } } : undefined
        )
      ),
  })
}

export function useListUserInvitations(client: AuthClient = authClient) {
  const { enabled } = useAuthenticatedQueryEnabled(client)
  return useQuery({
    queryKey: authQueryKeys.userInvitations(),
    enabled,
    queryFn: () =>
      unwrapClientResult(client.organization.listUserInvitations()),
  })
}

export function useOrganizationPermission(
  input: OrganizationPermissionCheck,
  organizationId?: string,
  client: AuthClient = authClient,
  options?: { enabled?: boolean }
) {
  const { permissions } = input
  const hookEnabled = options?.enabled ?? true
  const { enabled, session } = useAuthenticatedQueryEnabled(client)
  const resolvedOrganizationId = resolveActiveOrganizationId(
    organizationId,
    session
  )
  const { data: activeMember, isPending: memberPending } =
    useActiveMember(client)
  const { data: dynamicRoles, isPending: dynamicRolesPending } =
    useListOrganizationRoles(organizationId, client, {
      enabled: hookEnabled,
    })

  const hasDynamicRoles = (dynamicRoles?.length ?? 0) > 0
  const prerequisitesPending =
    hookEnabled &&
    enabled &&
    !!resolvedOrganizationId &&
    (memberPending || dynamicRolesPending)
  const canUseStaticCheck =
    hookEnabled &&
    enabled &&
    !!resolvedOrganizationId &&
    !prerequisitesPending &&
    !hasDynamicRoles &&
    !!activeMember?.role
  const shouldUseApi =
    hookEnabled &&
    enabled &&
    !!resolvedOrganizationId &&
    !prerequisitesPending &&
    hasDynamicRoles

  const staticQuery = useQuery({
    queryKey: authQueryKeys.organizationPermissionStatic(
      resolvedOrganizationId ?? "",
      activeMember?.role ?? "",
      permissions
    ),
    enabled: canUseStaticCheck,
    queryFn: () => {
      if (!activeMember?.role) {
        throw new Error("Active member role is required for permission check")
      }

      return createOrganizationPermissionResult(
        checkOrganizationPermissionMap(activeMember.role, permissions)
      )
    },
    staleTime: Number.POSITIVE_INFINITY,
  })

  const apiQuery = useQuery({
    queryKey: authQueryKeys.organizationPermission(
      resolvedOrganizationId ?? "",
      permissions
    ),
    enabled: shouldUseApi,
    queryFn: () =>
      unwrapClientResult(
        client.organization.hasPermission({
          permissions,
          ...(resolvedOrganizationId
            ? { organizationId: resolvedOrganizationId }
            : {}),
        })
      ),
  })

  if (!hookEnabled) {
    return {
      ...staticQuery,
      data: undefined,
      isPending: false,
      isLoading: false,
      isFetching: false,
    }
  }

  if (prerequisitesPending) {
    return {
      ...staticQuery,
      data: undefined,
      isPending: true,
      isLoading: true,
      isFetching: false,
    }
  }

  if (canUseStaticCheck) {
    return staticQuery
  }

  return apiQuery
}

export function useListOrganizationRoles(
  organizationId?: string,
  client: AuthClient = authClient,
  options?: { enabled?: boolean }
) {
  const hookEnabled = options?.enabled ?? true
  const { enabled, session } = useAuthenticatedQueryEnabled(client)
  const resolvedOrganizationId = resolveActiveOrganizationId(
    organizationId,
    session
  )

  return useQuery({
    queryKey: authQueryKeys.organizationRoles(resolvedOrganizationId),
    enabled: hookEnabled && enabled && !!resolvedOrganizationId,
    queryFn: async () => {
      return unwrapClientResult(
        client.organization.listRoles(
          organizationId ? { query: { organizationId } } : undefined
        )
      )
    },
  })
}

export function useAssignableOrganizationRoles(
  organizationId?: string,
  options?: { enabled?: boolean }
) {
  const hookEnabled = options?.enabled ?? true
  const { data: activeMember, isPending: memberPending } = useActiveMember()
  const { data: dynamicRoles, isPending: dynamicRolesPending } =
    useListOrganizationRoles(organizationId, authClient, {
      enabled: hookEnabled,
    })
  const { data: canUpdateMembers, isPending: updatePermissionPending } =
    useOrganizationPermission(
      { permissions: { member: ["update"] } },
      organizationId,
      authClient,
      { enabled: hookEnabled }
    )
  const { data: canInviteMembers, isPending: invitePermissionPending } =
    useOrganizationPermission(
      { permissions: { invitation: ["create"] } },
      organizationId,
      authClient,
      { enabled: hookEnabled }
    )

  const canAssignRoles =
    !!canUpdateMembers?.success || !!canInviteMembers?.success

  const assignableRoles = useMemo(
    () =>
      hookEnabled
        ? resolveAssignableOrganizationRoles({
            canAssignRoles,
            activeMemberRole: activeMember?.role,
            dynamicRoles,
          })
        : [],
    [activeMember?.role, canAssignRoles, dynamicRoles, hookEnabled]
  )

  return {
    roles: assignableRoles,
    formatOrganizationRoleLabel,
    isPending: hookEnabled
      ? memberPending ||
        dynamicRolesPending ||
        updatePermissionPending ||
        invitePermissionPending
      : false,
  }
}

export function useIsUsernameAvailable(
  username: string,
  client: AuthClient = authClient
) {
  return useQuery({
    queryKey: authQueryKeys.usernameAvailable(username),
    enabled: username.length > 0,
    queryFn: async () => {
      const isUsernameAvailable = (
        client as AuthClient & {
          isUsernameAvailable?: (input: {
            username: string
          }) => ReturnType<AuthClient["listSessions"]>
        }
      ).isUsernameAvailable
      if (!isUsernameAvailable) return { available: false }
      return unwrapClientResult(isUsernameAvailable({ username }))
    },
  })
}
