"use client"

import {
  type PasskeyAuthClient,
  useAddPasskey,
  useAuth,
  useAuthPlugin,
} from "@better-auth-ui/react"
import type { SyntheticEvent } from "react"

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
import { passkeyPlugin } from "@/lib/auth/passkey-plugin"

export type AddPasskeyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddPasskeyDialog({
  open,
  onOpenChange,
}: AddPasskeyDialogProps) {
  const { authClient, localization } = useAuth()
  const { localization: passkeyLocalization } = useAuthPlugin(passkeyPlugin)

  const { mutate: addPasskey, isPending: isAdding } = useAddPasskey(
    authClient as PasskeyAuthClient
  )

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.target as HTMLFormElement)
    const name = (formData.get("name") as string)?.trim()

    addPasskey(name ? { name } : undefined, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>{passkeyLocalization.addPasskey}</DialogTitle>
            <DialogDescription>
              {passkeyLocalization.passkeysDescription}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <Label htmlFor="passkey-name">{passkeyLocalization.name}</Label>
              <Input
                id="passkey-name"
                name="name"
                autoFocus
                placeholder={localization.settings.optional}
                disabled={isAdding}
              />
              <FieldError />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" />}
              disabled={isAdding}
            >
              {localization.settings.cancel}
            </DialogClose>
            <Button type="submit" disabled={isAdding}>
              {isAdding && <Spinner />}
              {passkeyLocalization.addPasskey}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
