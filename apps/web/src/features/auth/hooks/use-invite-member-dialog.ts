"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  useAssignableOrganizationRoles,
  useInviteMember,
} from "@workspace/auth/react"
import type { InviteMemberDialogProps } from "@workspace/ui/auth"
import { useEffect, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toastManager } from "@workspace/ui/components/toast"
import {
  inviteMemberSchema,
  type InviteMemberInput,
} from "@/features/auth/schemas"

export function useInviteMemberDialog() {
  const [open, setOpen] = useState(false)
  const { roles, formatOrganizationRoleLabel } = useAssignableOrganizationRoles(
    undefined,
    { enabled: open }
  )
  const { mutate: inviteMember, isPending } = useInviteMember()

  const defaultRole = roles.includes("member") ? "member" : (roles.at(-1) ?? "")

  const form = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: "", role: "" },
  })

  const email = useWatch({ control: form.control, name: "email" })
  const role = useWatch({ control: form.control, name: "role" })

  useEffect(() => {
    if (!open || roles.length === 0) return

    const currentRole = form.getValues("role")
    const nextRole = roles.includes(currentRole) ? currentRole : defaultRole
    form.setValue("role", nextRole, { shouldValidate: true })
  }, [defaultRole, form, open, roles])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      form.reset({ email: "", role: "" })
    }
    setOpen(nextOpen)
  }

  const dialogProps: InviteMemberDialogProps = {
    open,
    onOpenChange: handleOpenChange,
    roles,
    formatRoleLabel: formatOrganizationRoleLabel,
    isPending,
    email,
    onEmailChange: (value) =>
      form.setValue("email", value, { shouldValidate: true }),
    emailError: form.formState.errors.email?.message,
    role,
    onRoleChange: (value) =>
      form.setValue("role", value, { shouldValidate: true }),
    roleError: form.formState.errors.role?.message,
    onSubmit: form.handleSubmit((values) => {
      inviteMember(values, {
        onSuccess: () => {
          toastManager.add({
            title: "Invitation sent",
            type: "success",
          })
          handleOpenChange(false)
        },
      })
    }),
  }

  return {
    open,
    openDialog: () => setOpen(true),
    dialogProps,
  }
}
