"use client"

import {
  countOrganizationPermissions,
  isReservedOrganizationRoleName,
} from "@workspace/auth/permissions/organization"
import type { OrganizationPermissionMap } from "@workspace/auth/permissions/organization"
import {
  useCreateOrganizationRole,
  useDeleteOrganizationRole,
  useUpdateOrganizationRole,
} from "@workspace/auth/react"
import type { OrganizationRole } from "@workspace/auth/types/organization"
import { useState, type SubmitEventHandler } from "react"
import { toastManager } from "@workspace/ui/components/toast"
import { organizationRoleNameSchema } from "@/features/auth/schemas"

const emptyPermissions: OrganizationPermissionMap = {}

export function useOrganizationRoleDialogs() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<OrganizationRole | null>(
    null
  )
  const [roleName, setRoleName] = useState("")
  const [roleNameError, setRoleNameError] = useState<string>()
  const [permissionError, setPermissionError] = useState<string>()
  const [permissions, setPermissions] =
    useState<OrganizationPermissionMap>(emptyPermissions)

  const { mutate: createRole, isPending: isCreating } =
    useCreateOrganizationRole()
  const { mutate: updateRole, isPending: isUpdating } =
    useUpdateOrganizationRole()
  const { mutate: deleteRole, isPending: isDeleting } =
    useDeleteOrganizationRole()

  function resetCreateForm() {
    setRoleName("")
    setRoleNameError(undefined)
    setPermissionError(undefined)
    setPermissions(emptyPermissions)
  }

  function openCreateDialog() {
    resetCreateForm()
    setCreateOpen(true)
  }

  function handleCreateOpenChange(open: boolean) {
    if (!open) resetCreateForm()
    setCreateOpen(open)
  }

  function openEditDialog(role: OrganizationRole) {
    setSelectedRole(role)
    setPermissions(role.permission ?? emptyPermissions)
    setPermissionError(undefined)
    setEditOpen(true)
  }

  function handleEditOpenChange(open: boolean) {
    if (!open) {
      setSelectedRole(null)
      setPermissions(emptyPermissions)
      setPermissionError(undefined)
    }
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

  function validateRoleName(name: string) {
    const parsed = organizationRoleNameSchema.safeParse(name)
    if (!parsed.success) {
      return parsed.error.issues[0]?.message ?? "Invalid role name"
    }
    if (isReservedOrganizationRoleName(parsed.data)) {
      return "This role name is reserved"
    }
    return undefined
  }

  function validatePermissions(nextPermissions: OrganizationPermissionMap) {
    if (countOrganizationPermissions(nextPermissions) === 0) {
      return "Select at least one permission"
    }
    return undefined
  }

  const handleCreateSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    const nextRoleNameError = validateRoleName(roleName)
    const nextPermissionError = validatePermissions(permissions)
    setRoleNameError(nextRoleNameError)
    setPermissionError(nextPermissionError)
    if (nextRoleNameError || nextPermissionError) return

    createRole(
      {
        role: roleName.trim().toLowerCase(),
        permission: permissions,
      },
      {
        onSuccess: () => {
          toastManager.add({
            title: "Role created",
            type: "success",
          })
          handleCreateOpenChange(false)
        },
      }
    )
  }

  const handleEditSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    if (!selectedRole) return

    const nextPermissionError = validatePermissions(permissions)
    setPermissionError(nextPermissionError)
    if (nextPermissionError) return

    updateRole(
      {
        roleId: selectedRole.id,
        data: { permission: permissions },
      },
      {
        onSuccess: () => {
          toastManager.add({
            title: "Role updated",
            type: "success",
          })
          handleEditOpenChange(false)
        },
      }
    )
  }

  const handleDeleteSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    if (!selectedRole) return

    deleteRole(
      { roleId: selectedRole.id },
      {
        onSuccess: () => {
          toastManager.add({
            title: "Role deleted",
            type: "success",
          })
          handleDeleteOpenChange(false)
        },
      }
    )
  }

  return {
    rolesProps: {
      onCreateClick: openCreateDialog,
      onEditRole: openEditDialog,
      onDeleteRole: openDeleteDialog,
      createDialog: {
        open: createOpen,
        onOpenChange: handleCreateOpenChange,
        role: roleName,
        onRoleChange: (value: string) => {
          setRoleName(value)
          setRoleNameError(validateRoleName(value))
        },
        roleError: roleNameError,
        permissions,
        onPermissionsChange: (nextPermissions: OrganizationPermissionMap) => {
          setPermissions(nextPermissions)
          setPermissionError(validatePermissions(nextPermissions))
        },
        permissionError,
        isPending: isCreating,
        onSubmit: handleCreateSubmit,
      },
      editDialog: {
        open: editOpen,
        onOpenChange: handleEditOpenChange,
        role: selectedRole,
        permissions,
        onPermissionsChange: (nextPermissions: OrganizationPermissionMap) => {
          setPermissions(nextPermissions)
          setPermissionError(validatePermissions(nextPermissions))
        },
        permissionError,
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
