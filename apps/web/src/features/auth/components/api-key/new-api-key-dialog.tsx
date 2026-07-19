"use client"

import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { Check, Copy } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

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
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { Label } from "@workspace/ui/components/label"
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"

export type NewApiKeyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string | null
  secretKey: string | null
}

export function NewApiKeyDialog({
  open,
  onOpenChange,
  name,
  secretKey,
}: NewApiKeyDialogProps) {
  const { localization } = useAuth()
  const { localization: apiKeyLocalization } = useAuthPlugin(apiKeyPlugin)

  const [copied, setCopied] = useState(false)

  const copySecretKey = async () => {
    if (!secretKey) return

    try {
      await navigator.clipboard.writeText(secretKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{apiKeyLocalization.newApiKey}</DialogTitle>
          <DialogDescription>
            {apiKeyLocalization.newApiKeyWarning}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label htmlFor="new-api-key-secret">
            {name || apiKeyLocalization.apiKey}
          </Label>
          <InputGroup>
            <InputGroupInput
              id="new-api-key-secret"
              value={secretKey ?? ""}
              readOnly
              className="font-mono text-xs"
            />
            <InputGroupButton
              size="icon-xs"
              aria-label={localization.settings.copyToClipboard}
              onClick={copySecretKey}
            >
              {copied ? <Check /> : <Copy />}
            </InputGroupButton>
          </InputGroup>
        </div>

        <DialogFooter>
          <DialogClose render={<Button />}>
            {apiKeyLocalization.dismissNewKey}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
