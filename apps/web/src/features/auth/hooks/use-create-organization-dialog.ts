"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useCreateOrganization } from "@workspace/auth/react"
import type { CreateOrganizationDialogProps } from "@workspace/ui/auth"
import { sanitizeOrganizationSlug } from "@workspace/ui/auth"
import { useCallback, useEffect, useState } from "react"
import { useForm, useFormState, useWatch } from "react-hook-form"
import { toastManager } from "@workspace/ui/components/toast"
import {
  createOrganizationSchema,
  type CreateOrganizationInput,
} from "@/features/auth/schemas"

export function useCreateOrganizationDialog() {
  const [open, setOpen] = useState(false)
  const { mutate: createOrganization, isPending } = useCreateOrganization()

  const form = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { name: "", slug: "" },
  })

  const name = useWatch({ control: form.control, name: "name" })
  const slug = useWatch({ control: form.control, name: "slug" })
  const { dirtyFields } = useFormState({ control: form.control })

  const resetForm = useCallback(() => {
    form.reset({ name: "", slug: "" })
  }, [form])

  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open, resetForm])

  useEffect(() => {
    if (dirtyFields.slug) return
    form.setValue("slug", sanitizeOrganizationSlug(name), {
      shouldDirty: false,
      shouldValidate: Boolean(name),
    })
  }, [dirtyFields.slug, form, name])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        resetForm()
      }
      setOpen(nextOpen)
    },
    [resetForm]
  )

  const handleSlugChange = useCallback(
    (value: string) => {
      form.setValue("slug", value, { shouldDirty: true, shouldValidate: true })
    },
    [form]
  )

  const onSubmit = form.handleSubmit((values) => {
    createOrganization(values, {
      onSuccess: () => {
        toastManager.add({
          title: "Workspace created",
          type: "success",
        })
        handleOpenChange(false)
      },
    })
  })

  const dialogProps: CreateOrganizationDialogProps = {
    open,
    onOpenChange: handleOpenChange,
    isPending,
    name,
    onNameChange: (value) =>
      form.setValue("name", value, { shouldValidate: true }),
    nameError: form.formState.errors.name?.message,
    slug,
    onSlugChange: handleSlugChange,
    onSlugBlur: () => void form.trigger("slug"),
    slugError: form.formState.errors.slug?.message,
    onSubmit,
  }

  return {
    open,
    openDialog: () => setOpen(true),
    dialogProps,
  }
}
