"use client"

import type { OrganizationSlugAvailabilityState } from "./organization-slug-field"
import {
  useActiveOrganization,
  useOrganizationPermission,
} from "@workspace/auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@workspace/ui-shadcn/components/button"
import { Spinner } from "@workspace/ui-shadcn/components/spinner"
import { Card, CardContent } from "@workspace/ui-shadcn/components/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui-shadcn/components/form"
import { Input } from "@workspace/ui-shadcn/components/input"
import { Skeleton } from "@workspace/ui-shadcn/components/skeleton"
import { cn } from "@workspace/ui-shadcn/lib/utils"
import { OrganizationSlugField } from "./organization-slug-field"
import { organizationUiPermissions } from "./ui-permissions"

// ---------------------------------------------------------------------------
// Schema & types
// ---------------------------------------------------------------------------

const organizationProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required.")
    .max(100, "Name must be 100 characters or fewer."),
  slug: z
    .string()
    .min(1, "Slug is required.")
    .max(50, "Slug must be 50 characters or fewer.")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug may only contain lowercase letters, numbers, and hyphens."
    ),
})

type OrganizationProfileValues = z.infer<typeof organizationProfileSchema>

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type OrganizationProfileProps = {
  className?: string
  onSlugBlur?: () => void
  checkSlugAvailability?: boolean
  onSlugAvailabilityChange?: (state: OrganizationSlugAvailabilityState) => void
  onSubmit?: (values: OrganizationProfileValues) => Promise<void> | void
  isPending?: boolean
}

// ---------------------------------------------------------------------------
// Skeleton state
// ---------------------------------------------------------------------------

function OrganizationProfileSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn(className)}>
      <CardContent className="flex flex-col gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// OrganizationProfile
// ---------------------------------------------------------------------------

export function OrganizationProfile({
  className,
  onSlugBlur,
  checkSlugAvailability = true,
  onSlugAvailabilityChange,
  onSubmit,
  isPending = false,
}: OrganizationProfileProps) {
  const { data: activeOrganization } = useActiveOrganization()
  const { data: canUpdateOrganization, isPending: permissionPending } =
    useOrganizationPermission(organizationUiPermissions.updateOrganization)

  const readOnly = !canUpdateOrganization?.success

  const form = useForm<OrganizationProfileValues>({
    resolver: zodResolver(organizationProfileSchema),
    defaultValues: { name: "", slug: "" },
  })

  useEffect(() => {
    if (activeOrganization) {
      form.reset({
        name: activeOrganization.name ?? "",
        slug: activeOrganization.slug ?? "",
      })
    }
  }, [activeOrganization, form])

  const isSubmitting = form.formState.isSubmitting || isPending

  if (!activeOrganization || permissionPending) {
    return (
      <div>
        <h2 className="mb-3 text-sm font-semibold">Profile</h2>
        <OrganizationProfileSkeleton className={className} />
      </div>
    )
  }

  async function handleSubmit(values: OrganizationProfileValues) {
    await onSubmit?.(values)
  }

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold">Profile</h2>

      <Form {...form}>
        <form
          key={activeOrganization.id}
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <Card className={cn(className)}>
            <CardContent className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="organization"
                        disabled={isSubmitting || readOnly}
                        placeholder="Acme Inc."
                        type="text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <OrganizationSlugField
                      checkAvailability={checkSlugAvailability}
                      currentSlug={activeOrganization.slug}
                      disabled={isSubmitting || readOnly}
                      onAvailabilityChange={onSlugAvailabilityChange}
                      onBlur={() => {
                        field.onBlur()
                        onSlugBlur?.()
                      }}
                      onChange={field.onChange}
                      value={field.value}
                    />
                  </FormItem>
                )}
              />

              {readOnly ? null : (
                <Button
                  className="w-fit"
                  disabled={!onSubmit || isSubmitting}
                  size="sm"
                  type="submit"
                >
                  {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
                  Save changes
                </Button>
              )}
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}
