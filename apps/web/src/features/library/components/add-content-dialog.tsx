import { useEffect, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  ADD_CONTENT_CREATE_LABEL,
  ADD_CONTENT_CREATING_LABEL,
  ADD_CONTENT_DESCRIPTION,
  ADD_CONTENT_TITLE,
  ADD_CONTENT_UPLOADING_LABEL,
  ADD_CONTENT_WIKIPEDIA_PREFIX,
  AddContentMode,
} from "@/features/library/components/add-content-constants"
import { AddContentBody } from "@/features/library/components/add-content-body"
import {
  canCreateContent,
  resolveContentError,
} from "@/features/library/components/add-content-helpers"
import { AddContentModeToggle } from "@/features/library/components/add-content-mode-toggle"
import {
  useSavePdfContent,
  useSaveUrlContent,
} from "@/features/library/hooks/use-content"

interface AddContentDialogProps {
  readonly open: boolean
  readonly initialMode?: AddContentMode
  readonly initialUrl?: string
  readonly onOpenChange: (open: boolean) => void
}

export function AddContentDialog(props: AddContentDialogProps) {
  const saveUrl = useSaveUrlContent()
  const savePdf = useSavePdfContent()
  const [mode, setMode] = useState(props.initialMode ?? AddContentMode.Link)
  const [url, setUrl] = useState(props.initialUrl ?? "")
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (!props.open) return
    setMode(props.initialMode ?? AddContentMode.Link)
    setUrl(props.initialUrl ?? "")
    setFile(null)
  }, [props.open, props.initialMode, props.initialUrl])

  const isPending = saveUrl.isPending || savePdf.isPending
  const errorMessage = resolveContentError({
    urlError: saveUrl.error,
    pdfError: savePdf.error,
  })

  function selectMode(next: AddContentMode) {
    setMode(next)
    if (next === AddContentMode.Wiki) setUrl(ADD_CONTENT_WIKIPEDIA_PREFIX)
  }

  function onCreate() {
    if (mode === AddContentMode.Pdf) {
      if (!file || savePdf.isPending) return
      savePdf.mutate(file, { onSuccess: () => props.onOpenChange(false) })
      return
    }
    const trimmed = url.trim()
    if (!trimmed || saveUrl.isPending) return
    saveUrl.mutate(
      { url: trimmed },
      { onSuccess: () => props.onOpenChange(false) }
    )
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{ADD_CONTENT_TITLE}</DialogTitle>
          <DialogDescription>{ADD_CONTENT_DESCRIPTION}</DialogDescription>
        </DialogHeader>
        <AddContentBody
          mode={mode}
          url={url}
          file={file}
          isPending={isPending}
          errorMessage={errorMessage}
          onUrlChange={setUrl}
          onCreate={onCreate}
          onFileSelect={(next) => {
            setFile(next)
            setMode(AddContentMode.Pdf)
          }}
          onClearFile={() => setFile(null)}
        />
        <DialogFooter className="sm:justify-between">
          <AddContentModeToggle
            mode={mode}
            disabled={isPending}
            onSelect={selectMode}
          />
          <Button
            type="button"
            disabled={isPending || !canCreateContent({ mode, url, file })}
            onClick={onCreate}
          >
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            {pendingLabel({ mode, isPending })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function pendingLabel(config: {
  readonly mode: AddContentMode
  readonly isPending: boolean
}) {
  if (!config.isPending) return ADD_CONTENT_CREATE_LABEL
  if (config.mode === AddContentMode.Pdf) return ADD_CONTENT_UPLOADING_LABEL
  return ADD_CONTENT_CREATING_LABEL
}
