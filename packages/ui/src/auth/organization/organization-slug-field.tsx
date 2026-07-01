"use client"

import { useCheckSlug } from "@workspace/auth/react"
import { Check, X } from "lucide-react"
import { useEffect } from "react"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { Spinner } from "@workspace/ui/components/spinner"
import { sanitizeOrganizationSlug } from "./sanitize-slug"

export function isSameOrganizationSlug(
  value: string,
  currentSlug?: string | null
) {
  if (!currentSlug) return false

  return (
    sanitizeOrganizationSlug(value.trim()) ===
    sanitizeOrganizationSlug(currentSlug.trim())
  )
}

export interface OrganizationSlugFieldProps {
  id?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  currentSlug?: string
  checkAvailability?: boolean
  disabled?: boolean
  error?: string
}

function SlugAvailabilityIcon({
  isChecking,
  isAvailable,
  hasError,
}: {
  isChecking: boolean
  isAvailable?: boolean
  hasError: boolean
}) {
  if (isChecking) return <Spinner />
  if (isAvailable) return <Check className="size-4" />
  if (hasError) return <X className="size-4 text-destructive-foreground" />
  return null
}

export function OrganizationSlugField({
  id = "organization-slug",
  value,
  onChange,
  onBlur,
  currentSlug,
  checkAvailability = true,
  disabled,
  error,
}: OrganizationSlugFieldProps) {
  const {
    mutate: checkSlug,
    data: checkSlugData,
    error: checkSlugError,
    isPending: isCheckingSlug,
    reset: resetCheckSlug,
  } = useCheckSlug()

  const trimmedValue = value.trim()
  const isCurrentSlug = isSameOrganizationSlug(value, currentSlug)
  const shouldCheckAvailability =
    checkAvailability && trimmedValue.length > 0 && !isCurrentSlug

  useEffect(() => {
    resetCheckSlug()

    if (!shouldCheckAvailability) return

    const timeout = window.setTimeout(() => {
      checkSlug({ slug: trimmedValue })
    }, 500)

    return () => window.clearTimeout(timeout)
  }, [checkSlug, resetCheckSlug, shouldCheckAvailability, trimmedValue])

  const slugTaken =
    shouldCheckAvailability &&
    (!!checkSlugError || checkSlugData?.status === false)
  const validationError =
    error ?? (slugTaken ? "This slug is already taken" : undefined)

  return (
    <Field invalid={!!validationError}>
      <FieldLabel htmlFor={id}>Slug</FieldLabel>
      <InputGroup>
        <InputGroupInput
          aria-invalid={!!validationError}
          autoComplete="off"
          disabled={disabled}
          id={id}
          onBlur={onBlur}
          onChange={(event) =>
            onChange(sanitizeOrganizationSlug(event.target.value))
          }
          placeholder="my-team"
          type="text"
          value={value}
        />
        {shouldCheckAvailability ? (
          <InputGroupAddon align="inline-end">
            <SlugAvailabilityIcon
              hasError={slugTaken}
              isAvailable={checkSlugData?.status}
              isChecking={isCheckingSlug}
            />
          </InputGroupAddon>
        ) : null}
      </InputGroup>
      <FieldError>{validationError}</FieldError>
    </Field>
  )
}
