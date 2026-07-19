"use client"

import * as React from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group"

export type PasswordInputProps = Omit<React.ComponentProps<"input">, "type"> & {
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
}

function PasswordInput({
  className,
  visible: visibleProp,
  onVisibleChange,
  disabled,
  placeholder = "••••••••",
  autoComplete = "current-password",
  ...props
}: PasswordInputProps) {
  const [uncontrolledVisible, setUncontrolledVisible] = React.useState(false)
  const visible = visibleProp ?? uncontrolledVisible

  function setVisible(next: boolean) {
    if (visibleProp === undefined) {
      setUncontrolledVisible(next)
    }
    onVisibleChange?.(next)
  }

  return (
    <InputGroup className={cn(className)} data-disabled={disabled || undefined}>
      <InputGroupInput
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        disabled={disabled}
        placeholder={placeholder}
        spellCheck={false}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          size="icon-xs"
          disabled={disabled}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export { PasswordInput }
