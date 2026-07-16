import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui-shadcn/components/button"
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui-shadcn/components/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui-shadcn/components/field"
import { Input } from "@workspace/ui-shadcn/components/input"
import { Spinner } from "@workspace/ui-shadcn/components/spinner"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import {
  RolePermissionPicker,
  countSelectedPermissions,
  permissionStateFromRole,
  toPermissionPayload,
} from "@/features/organization/components/role-permission-picker"
import type { OrganizationRole } from "@/features/organization/hooks/use-organization-roles"
import {
  ROLE_PERMISSION_CATALOG,
  type PermissionResource,
} from "@/features/organization/lib/organization-roles"
import { saveOrganizationRole } from "@/features/organization/lib/save-organization-role"

const RoleNameSchema = z.object({
  role: z
    .string()
    .trim()
    .min(2, "Role name is required")
    .max(40)
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_-]*$/,
      "Use letters, numbers, - or _ (stored lowercase)"
    )
    .transform((value) => value.toLowerCase()),
})

type RoleNameValues = z.infer<typeof RoleNameSchema>

type RoleFormBodyProps = {
  readonly editingRole: OrganizationRole | null
  readonly onOpenChange: (open: boolean) => void
  readonly onSaved: () => void
}

export function RoleFormBody({
  editingRole,
  onOpenChange,
  onSaved,
}: RoleFormBodyProps) {
  const isEditing = Boolean(editingRole)
  const [isPending, setIsPending] = useState(false)
  const [permissionState, setPermissionState] = useState(() =>
    permissionStateFromRole(editingRole?.permission ?? {})
  )
  const form = useForm<RoleNameValues>({
    resolver: zodResolver(RoleNameSchema),
    defaultValues: { role: editingRole?.role ?? "" },
  })
  const selectedCount = countSelectedPermissions(permissionState)
  const nameError = form.formState.errors.role

  function toggleAction(resource: PermissionResource, action: string) {
    setPermissionState((current) => {
      const set = new Set(current[resource] ?? [])
      if (set.has(action)) set.delete(action)
      else set.add(action)
      return { ...current, [resource]: set }
    })
  }

  function toggleResource(resource: PermissionResource) {
    const catalogActions = ROLE_PERMISSION_CATALOG[resource]
    setPermissionState((current) => {
      const selected = current[resource] ?? new Set<string>()
      const allSelected = catalogActions.every((action) => selected.has(action))
      if (allSelected) return { ...current, [resource]: new Set() }
      return { ...current, [resource]: new Set(catalogActions) }
    })
  }

  async function handleSubmit(values: RoleNameValues) {
    const permission = toPermissionPayload(permissionState)
    if (Object.keys(permission).length === 0) {
      toast.error("Select at least one permission")
      return
    }
    setIsPending(true)
    const saved = await saveOrganizationRole({
      editingRole,
      roleName: values.role,
      permission,
    })
    setIsPending(false)
    if (!saved) return
    onSaved()
    onOpenChange(false)
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(handleSubmit)}>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit custom role" : "Create custom role"}
        </DialogTitle>
        <DialogDescription>
          Choose a name and the permissions this role should grant. You can only
          include permissions you already have.
        </DialogDescription>
      </DialogHeader>

      <FieldGroup className="max-h-[60vh] gap-5 overflow-y-auto py-4">
        <Field data-invalid={nameError ? true : undefined}>
          <FieldLabel htmlFor="role-name">Role name</FieldLabel>
          <Input
            disabled={isPending}
            id="role-name"
            placeholder="support"
            {...form.register("role")}
          />
          <FieldDescription>
            Letters, numbers, hyphens, and underscores. Saved in lowercase.
          </FieldDescription>
          <FieldError errors={[nameError]} />
        </Field>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <FieldLabel>Permissions</FieldLabel>
            <span className="text-xs text-muted-foreground">
              {selectedCount} selected
            </span>
          </div>
          <RolePermissionPicker
            disabled={isPending}
            permissionState={permissionState}
            onToggleAction={toggleAction}
            onToggleResource={toggleResource}
          />
        </div>
      </FieldGroup>

      <DialogFooter>
        <DialogClose
          disabled={isPending}
          render={<Button type="button" variant="outline" />}
        >
          Cancel
        </DialogClose>
        <Button disabled={isPending || selectedCount === 0} type="submit">
          {isPending ? <Spinner data-icon="inline-start" /> : null}
          {isEditing ? "Save changes" : "Create role"}
        </Button>
      </DialogFooter>
    </form>
  )
}
