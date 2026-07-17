"use client"

import {
  type ApiKeyAuthClient,
  useAuth,
  useAuthPlugin,
  useListApiKeys,
} from "@better-auth-ui/react"
import { useState } from "react"

import { Button } from "@workspace/ui-shadcn/components/button"
import { Card, CardContent } from "@workspace/ui-shadcn/components/card"
import { ItemGroup, ItemSeparator } from "@workspace/ui-shadcn/components/item"
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"
import { cn } from "@workspace/ui-shadcn/lib/utils"
import { SectionHeader } from "@/components/page-header"
import { ApiKey } from "@/features/auth/components/api-key/api-key"
import { ApiKeySkeleton } from "@/features/auth/components/api-key/api-key-skeleton"
import { ApiKeysEmpty } from "@/features/auth/components/api-key/api-keys-empty"
import { CreateApiKeyDialog } from "@/features/auth/components/api-key/create-api-key-dialog"

export type ApiKeysProps = {
  className?: string
  /** Scope the list and create payload to an organization. */
  organizationId?: string
  /** Force the loading skeleton and disable the list query. */
  isPending?: boolean
  /** Hide the "Create API key" button (header + empty state). */
  hideCreate?: boolean
  /** Hide the per-row delete button on listed keys. */
  hideDelete?: boolean
}

export function ApiKeys({
  className,
  organizationId,
  isPending: isPendingProp,
  hideCreate,
  hideDelete,
}: ApiKeysProps) {
  const { authClient } = useAuth()
  const { localization: apiKeyLocalization } = useAuthPlugin(apiKeyPlugin)

  const { data: listData, isPending: isListPending } = useListApiKeys(
    authClient as ApiKeyAuthClient,
    {
      enabled: !isPendingProp,
      ...(organizationId
        ? { query: { organizationId, configId: "organization" } }
        : {}),
    }
  )

  const isPending = isPendingProp || isListPending
  const [createOpen, setCreateOpen] = useState(false)
  const apiKeys = listData?.apiKeys ?? []

  function renderCardContent() {
    if (isPending) {
      return (
        <ItemGroup className="gap-0">
          <ApiKeySkeleton />
          <ItemSeparator />
          <ApiKeySkeleton />
        </ItemGroup>
      )
    }

    if (apiKeys.length === 0) {
      return <ApiKeysEmpty />
    }

    return (
      <ItemGroup className="gap-0">
        {apiKeys.map((key, index) => (
          <div key={key.id}>
            {index > 0 ? <ItemSeparator /> : null}
            <ApiKey
              apiKey={key}
              hideDelete={hideDelete}
              organizationId={organizationId}
            />
          </div>
        ))}
      </ItemGroup>
    )
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <SectionHeader
        actions={
          !hideCreate ? (
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => setCreateOpen(true)}
            >
              {apiKeyLocalization.createApiKey}
            </Button>
          ) : null
        }
        title={apiKeyLocalization.apiKeys}
      />

      <Card>
        <CardContent>{renderCardContent()}</CardContent>
      </Card>

      {!hideCreate ? (
        <CreateApiKeyDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          organizationId={organizationId}
        />
      ) : null}
    </div>
  )
}
