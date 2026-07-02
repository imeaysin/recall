"use client"

import type { SubmitEventHandler } from "react"
import type { OrganizationSlugAvailabilityState } from "./organization-slug-field"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Form } from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"
import { Pane } from "@workspace/ui/components/pane"
import { OrganizationSlugField } from "./organization-slug-field"

export interface CreateOrganizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  onNameChange: (value: string) => void
  nameError?: string
  slug: string
  onSlugChange: (value: string) => void
  onSlugBlur?: () => void
  onSlugAvailabilityChange?: (state: OrganizationSlugAvailabilityState) => void
  slugError?: string
  onSubmit: SubmitEventHandler<HTMLFormElement>
  isPending?: boolean
  canSubmit?: boolean
  required?: boolean
  showSlug?: boolean
  title?: string
  description?: string
  submitLabel?: string
}

export function CreateOrganizationDialog({
  open,
  onOpenChange,
  name,
  onNameChange,
  nameError,
  slug,
  onSlugChange,
  onSlugBlur,
  onSlugAvailabilityChange,
  slugError,
  onSubmit,
  isPending = false,
  canSubmit = true,
  required = false,
  showSlug = true,
  title = "Create workspace",
  description = "Create a workspace to collaborate with your team.",
  submitLabel = "Create workspace",
}: CreateOrganizationDialogProps) {
  function handleOpenChange(nextOpen: boolean) {
    if (required && !nextOpen) return
    onOpenChange(nextOpen)
  }

  return (
    <Pane onOpenChange={handleOpenChange} open={open}>
      <Pane.Content showCloseButton={!required}>
        <Pane.Header>
          <Pane.Title>{title}</Pane.Title>
          <Pane.Description>{description}</Pane.Description>
        </Pane.Header>

        <Form
          className="contents"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit(event)
          }}
        >
          <Pane.Panel className="flex flex-col gap-4">
            <Field invalid={Boolean(nameError)}>
              <FieldLabel htmlFor="create-organization-name">Name</FieldLabel>
              <Input
                autoFocus
                disabled={isPending}
                id="create-organization-name"
                onChange={(event) => onNameChange(event.target.value)}
                placeholder="Acme Inc."
                type="text"
                value={name}
              />
              <FieldError match={Boolean(nameError)}>{nameError}</FieldError>
            </Field>

            {showSlug ? (
              <OrganizationSlugField
                disabled={isPending}
                error={slugError}
                id="create-organization-slug"
                onAvailabilityChange={onSlugAvailabilityChange}
                onBlur={onSlugBlur}
                onChange={onSlugChange}
                value={slug}
              />
            ) : null}
          </Pane.Panel>

          <Pane.Footer>
            {required ? null : (
              <Pane.Close
                render={
                  <Button
                    disabled={isPending}
                    type="button"
                    variant="outline"
                  />
                }
              >
                Cancel
              </Pane.Close>
            )}
            <Button disabled={!canSubmit} loading={isPending} type="submit">
              {submitLabel}
            </Button>
          </Pane.Footer>
        </Form>
      </Pane.Content>
    </Pane>
  )
}
