"use client"

import type { ReactNode } from "react"
import { Card, CardContent } from "@workspace/ui-shadcn/components/card"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@workspace/ui-shadcn/components/input-otp"
import { Spinner } from "@workspace/ui-shadcn/components/spinner"
import { cn } from "@workspace/ui-shadcn/lib/utils"

export type AuthOtpInputProps = {
  id?: string
  value: string
  onValueChange: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  invalid?: boolean
  verifying?: boolean
  verifyingLabel?: string
}

export function AuthOtpInput({
  id,
  value,
  onValueChange,
  onComplete,
  disabled = false,
  invalid = false,
  verifying = false,
  verifyingLabel = "Verifying...",
}: AuthOtpInputProps) {
  if (verifying) {
    return (
      <Card className="rounded-none shadow-xs">
        <CardContent className="flex h-16 items-center justify-center">
          <div className="flex items-center gap-2">
            <Spinner className="size-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {verifyingLabel}
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <InputOTP
      aria-invalid={invalid || undefined}
      className="justify-center gap-2"
      disabled={disabled}
      id={id}
      maxLength={6}
      onChange={onValueChange}
      onComplete={onComplete}
      value={value}
    >
      <InputOTPGroup>
        {Array.from({ length: 6 }).map((_, index) => (
          <InputOTPSlot
            key={index}
            aria-label={`Character ${index + 1} of 6`}
            className={cn(
              "size-14 text-lg leading-14 sm:size-14 sm:text-lg sm:leading-14",
              invalid && "border-destructive"
            )}
            index={index}
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  )
}

export type AuthPageBodyProps = {
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function AuthPageBody({
  children,
  footer,
  className,
}: AuthPageBodyProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {children}
      {footer ? <div className="text-center">{footer}</div> : null}
    </div>
  )
}
