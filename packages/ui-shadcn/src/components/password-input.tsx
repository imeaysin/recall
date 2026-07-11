"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@workspace/ui-shadcn/components/button"
import { Input } from "@workspace/ui-shadcn/components/input"
import { cn } from "@workspace/ui-shadcn/lib/utils"

export type PasswordInputProps = React.ComponentProps<"input">

function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <Input
        {...props}
        className={cn("pr-9", className)}
        type={show ? "text" : "password"}
      />
      <Button
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute top-0 right-0 h-full px-2.5 text-muted-foreground hover:text-foreground"
        onClick={() => setShow((v) => !v)}
        size="icon"
        tabIndex={-1}
        type="button"
        variant="ghost"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  )
}

export { PasswordInput }
