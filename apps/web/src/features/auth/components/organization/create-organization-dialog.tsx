"use client"

import {
  type OrganizationAuthClient,
  useAuth,
  useAuthPlugin,
  useCreateOrganization,
} from "@better-auth-ui/react"
import { type SyntheticEvent, useState } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Field, FieldError, FieldGroup } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Spinner } from "@workspace/ui/components/spinner"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import {
  SlugField,
  sanitizeSlug,
} from "@/features/auth/components/organization/slug-field"

/** Props for the `CreateOrganizationDialog` component. */
export type CreateOrganizationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateOrganizationDialog({
  open,
  onOpenChange,
}: CreateOrganizationDialogProps) {
  const { authClient, localization } = useAuth()
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugEdited, setSlugEdited] = useState(false)
  const [nameError, setNameError] = useState<string>()

  const { mutate: createOrganization, isPending: isCreating } =
    useCreateOrganization(authClient as OrganizationAuthClient, {
      onSuccess: () => onOpenChange(false),
    })

  const effectiveSlug = slugEdited ? slug : sanitizeSlug(name)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSlug("")
      setName("")
      setSlugEdited(false)
      setNameError(undefined)
    }
    onOpenChange(nextOpen)
  }

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    createOrganization({ name, slug: effectiveSlug })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>
              {organizationLocalization.createOrganization}
            </DialogTitle>
            <DialogDescription>
              {organizationLocalization.organizationsDescription}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field data-invalid={!!nameError}>
              <Label htmlFor="create-organization-name">
                {organizationLocalization.name}
              </Label>
              <Input
                id="create-organization-name"
                name="name"
                autoFocus
                required
                placeholder={organizationLocalization.namePlaceholder}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setNameError(undefined)
                }}
                onInvalid={(e) => {
                  e.preventDefault()
                  setNameError(localization.auth.fieldRequired)
                }}
                aria-invalid={!!nameError}
                disabled={isCreating}
              />
              <FieldError>{nameError}</FieldError>
            </Field>

            <SlugField
              id="create-organization-slug"
              value={effectiveSlug}
              onChange={(value) => {
                setSlug(value)
                setSlugEdited(true)
              }}
              disabled={isCreating}
            />
          </FieldGroup>

          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" />}
              disabled={isCreating}
            >
              {localization.settings.cancel}
            </DialogClose>
            <Button type="submit" disabled={isCreating}>
              {isCreating && <Spinner />}
              {organizationLocalization.createOrganization}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
