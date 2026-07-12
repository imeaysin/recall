"use client"

import type { OrganizationPermissionMap } from "@workspace/auth/permissions/organization"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@workspace/ui-shadcn/components/button"
import { Spinner } from "@workspace/ui-shadcn/components/spinner"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui-shadcn/components/form"
import { Input } from "@workspace/ui-shadcn/components/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@workspace/ui-shadcn/components/dialog"
import { OrganizationRolePermissions } from "./organization-role-permissions"

/**
 * @description Schema & types
 */

const createOrganizationRoleSchema = z.object({
  role: z
    .string()
    .min(1, "Role name is required.")
    .max(50, "Role name must be 50 characters or fewer.")
    .regex(
      /^[a-z0-9-]+$/,
      "Role name may only contain lowercase letters, numbers, and hyphens."
    ),
  permission: z.custom<OrganizationPermissionMap>(
    (val) => typeof val === "object" && val !== null,
    "Permissions must be a valid permission map."
  ),
})

type CreateOrganizationRoleValues = {
  role: string
  permission: OrganizationPermissionMap
}

/**
 * @description Public types
 */

export type CreateOrganizationRoleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultPermissions?: OrganizationPermissionMap
  onSubmit: (values: CreateOrganizationRoleValues) => Promise<void> | void
}

/**
 * @description CreateOrganizationRoleDialog
 */

export function CreateOrganizationRoleDialog({
  open,
  onOpenChange,
  defaultPermissions = {} as OrganizationPermissionMap,
  onSubmit,
}: CreateOrganizationRoleDialogProps) {
  const form = useForm<CreateOrganizationRoleValues>({
    resolver: zodResolver(createOrganizationRoleSchema),
    defaultValues: { role: "", permission: defaultPermissions },
  })

  const isSubmitting = form.formState.isSubmitting

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) form.reset()
    onOpenChange(nextOpen)
  }

  async function handleSubmit(values: CreateOrganizationRoleValues) {
    await onSubmit(values)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader className="border-b px-6 pb-4">
          <DialogTitle>Create role</DialogTitle>
          <DialogDescription>
            Add a custom role with create, read, update, and delete access.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            noValidate
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoFocus
                        disabled={isSubmitting}
                        placeholder="moderator"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permission"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <OrganizationRolePermissions
                        disabled={isSubmitting}
                        onChange={field.onChange}
                        permissions={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="border-t px-6 py-4">
              <DialogClose asChild>
                <Button disabled={isSubmitting} type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
                Create role
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
