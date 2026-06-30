"use client"

import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { authClient, type AuthClient } from "../lib/auth-client"
import { useAuthUiConfig } from "./auth-ui-config"
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
  return useQuery({
    queryKey: authQueryKeys.activeOrganization(slug),
    enabled,
    queryFn: async () => {
      const { data: session } = client.useSession.get()
      if (slug) {
        const organizations = await unwrapClientResult(
          client.organization.list()
        )
        return (
          organizations?.find(
            (organization: { slug?: string }) => organization.slug === slug
          ) ?? null
        )
      }
      const activeOrganizationId = session?.session.activeOrganizationId
      if (!activeOrganizationId) return null
      return unwrapClientResult(
        client.organization.getFullOrganization({
          query: { organizationId: activeOrganizationId },
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
  return useQuery({
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

export function useListOrganizationMembers(
  organizationId?: string,
  client: AuthClient = authClient
) {
  const { enabled } = useAuthenticatedQueryEnabled(client)
  return useQuery({
    queryKey: authQueryKeys.organizationMembers(organizationId),
    enabled: enabled && !!organizationId,
    queryFn: () =>
      unwrapClientResult(
        client.organization.listMembers({
          query: { organizationId: organizationId! },
        })
      ),
  })
}

export function useListOrganizationInvitations(
  organizationId?: string,
  client: AuthClient = authClient
) {
  const { enabled } = useAuthenticatedQueryEnabled(client)
  return useQuery({
    queryKey: authQueryKeys.organizationInvitations(organizationId),
    enabled: enabled && !!organizationId,
    queryFn: () =>
      unwrapClientResult(
        client.organization.listInvitations({
          query: { organizationId: organizationId! },
        })
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

export function useHasPermission(
  input: {
    organizationId: string
    permission: Record<string, string[]>
  },
  client: AuthClient = authClient
) {
  const { enabled } = useAuthenticatedQueryEnabled(client)
  return useQuery({
    queryKey: authQueryKeys.organizationPermission(
      input.organizationId,
      input.permission
    ),
    enabled: enabled && !!input.organizationId,
    queryFn: () =>
      unwrapClientResult(
        client.organization.hasPermission({
          organizationId: input.organizationId,
          permissions: input.permission,
        })
      ),
  })
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
