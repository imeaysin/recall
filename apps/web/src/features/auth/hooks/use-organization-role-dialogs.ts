import type { OrganizationPermissionMap } from "@workspace/auth/permissions/organization"
import {
  useCreateOrganizationRole,
  useDeleteOrganizationRole,
  useUpdateOrganizationRole,
} from "@workspace/auth/react"
import type { OrganizationRole } from "@workspace/auth/types/organization"
import { useState } from "react"
import { toast } from "@workspace/ui-shadcn/components/sonner"

export function useOrganizationRoleDialogs() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<OrganizationRole | null>(
    null
  )

  const { mutateAsync: createRole, isPending: isCreating } =
    useCreateOrganizationRole()
  const { mutateAsync: updateRole, isPending: isUpdating } =
    useUpdateOrganizationRole()
  const { mutateAsync: deleteRole, isPending: isDeleting } =
    useDeleteOrganizationRole()

  function openCreateDialog() {
    setCreateOpen(true)
  }

  function handleCreateOpenChange(open: boolean) {
    setCreateOpen(open)
  }

  function openEditDialog(role: OrganizationRole) {
    setSelectedRole(role)
    setEditOpen(true)
  }

  function handleEditOpenChange(open: boolean) {
    if (!open) setSelectedRole(null)
    setEditOpen(open)
  }

  function openDeleteDialog(role: OrganizationRole) {
    setSelectedRole(role)
    setDeleteOpen(true)
  }

  function handleDeleteOpenChange(open: boolean) {
    if (!open) setSelectedRole(null)
    setDeleteOpen(open)
  }

  async function handleCreateSubmit(values: {
    role: string
    permission: OrganizationPermissionMap
  }) {
    const promise = createRole({
      role: values.role.trim().toLowerCase(),
      permission: values.permission,
    })
    toast.promise(promise, {
      loading: "Creating role…",
      success: "Role created",
      error: "Could not create role",
    })
    try {
      await promise
      handleCreateOpenChange(false)
    } catch {
      // handled by toast
    }
  }

  async function handleEditSubmit(values: {
    permission: OrganizationPermissionMap
  }) {
    if (!selectedRole) return

    const promise = updateRole({
      roleId: selectedRole.id,
      data: { permission: values.permission },
    })
    toast.promise(promise, {
      loading: "Updating role…",
      success: "Role updated",
      error: "Could not update role",
    })
    try {
      await promise
      handleEditOpenChange(false)
    } catch {
      // handled by toast
    }
  }

  async function handleDeleteSubmit() {
    if (!selectedRole) return

    const promise = deleteRole({ roleId: selectedRole.id })
    toast.promise(promise, {
      loading: "Deleting role…",
      success: "Role deleted",
      error: "Could not delete role",
    })
    try {
      await promise
      handleDeleteOpenChange(false)
    } catch {
      // handled by toast
    }
  }

  return {
    rolesProps: {
      onCreateClick: openCreateDialog,
      onEditRole: openEditDialog,
      onDeleteRole: openDeleteDialog,
      createDialog: {
        open: createOpen,
        onOpenChange: handleCreateOpenChange,
        defaultPermissions: {},
        isPending: isCreating,
        onSubmit: handleCreateSubmit,
      },
      editDialog: {
        open: editOpen,
        onOpenChange: handleEditOpenChange,
        role: selectedRole,
        isPending: isUpdating,
        onSubmit: handleEditSubmit,
      },
      deleteDialog: {
        open: deleteOpen,
        onOpenChange: handleDeleteOpenChange,
        role: selectedRole,
        isPending: isDeleting,
        onSubmit: handleDeleteSubmit,
      },
    },
  }
}
