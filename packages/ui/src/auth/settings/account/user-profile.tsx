"use client"

import { useSession, useUpdateUser } from "@workspace/auth/react"
import { type SyntheticEvent, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardFooter, CardPanel } from "@workspace/ui/components/card"
import { Field, FieldError } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Spinner } from "@workspace/ui/components/spinner"
import { toastManager } from "@workspace/ui/components/toast"
import { cn } from "@workspace/ui/lib/utils"

export interface UserProfileProps {
  className?: string
}

export function UserProfile({ className }: UserProfileProps) {
  const { data: session } = useSession()
  const { mutate: updateUser, isPending } = useUpdateUser()
  const [fieldErrors, setFieldErrors] = useState<{ name?: string }>({})

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    updateUser(
      { name: formData.get("name") as string },
      {
        onSuccess: () => {
          toastManager.add({
            title: "Profile updated",
            type: "success",
          })
        },
      }
    )
  }

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold">Profile</h2>

      <form onSubmit={handleSubmit}>
        <Card className={cn(className)}>
          <CardPanel className="flex flex-col gap-6">
            <Field data-invalid={!!fieldErrors.name}>
              <Label htmlFor="name">Name</Label>

              {session ? (
                <Input
                  key={session.user.name}
                  aria-invalid={!!fieldErrors.name}
                  autoComplete="name"
                  defaultValue={session.user.name}
                  disabled={isPending}
                  id="name"
                  name="name"
                  onChange={() => {
                    setFieldErrors((prev) => ({ ...prev, name: undefined }))
                  }}
                  onInvalid={(e) => {
                    e.preventDefault()
                    setFieldErrors((prev) => ({
                      ...prev,
                      name: (e.target as HTMLInputElement).validationMessage,
                    }))
                  }}
                  placeholder="Name"
                  required
                />
              ) : (
                <Skeleton>
                  <Input className="invisible" />
                </Skeleton>
              )}

              <FieldError>{fieldErrors.name}</FieldError>
            </Field>
          </CardPanel>

          <CardFooter>
            <Button disabled={isPending || !session} size="sm" type="submit">
              {isPending ? <Spinner /> : null}
              Save changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
