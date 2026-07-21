import { useRef } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { useSavePdfContent, useSaveUrlContent } from "../hooks/use-content"

type SaveUrlFormProps = {
  readonly url: string
  readonly onUrlChange: (value: string) => void
}

export function SaveUrlForm({ url, onUrlChange }: SaveUrlFormProps) {
  const saveUrl = useSaveUrlContent()
  const savePdf = useSavePdfContent()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const urlErrorMessage =
    saveUrl.error instanceof Error
      ? saveUrl.error.message
      : "Failed to save URL"
  const pdfErrorMessage =
    savePdf.error instanceof Error
      ? savePdf.error.message
      : "Failed to upload PDF"

  return (
    <div className="flex flex-col gap-3">
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          const trimmed = url.trim()
          if (!trimmed) return
          saveUrl.mutate(
            { url: trimmed },
            {
              onSuccess: () => onUrlChange(""),
            }
          )
        }}
      >
        <Input
          className="min-w-[200px] flex-1"
          value={url}
          onChange={(event) => onUrlChange(event.target.value)}
          placeholder="https://example.com/article"
          type="url"
          required
        />
        <Button type="submit" disabled={saveUrl.isPending}>
          {saveUrl.isPending ? "Saving…" : "Save URL"}
        </Button>
        {saveUrl.isError ? (
          <p className="basis-full text-sm text-destructive">
            {urlErrorMessage}
          </p>
        ) : null}
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) return
            savePdf.mutate(file, {
              onSuccess: () => {
                event.target.value = ""
              },
            })
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={savePdf.isPending}
          onClick={() => fileInputRef.current?.click()}
        >
          {savePdf.isPending ? "Uploading…" : "Upload PDF"}
        </Button>
        {savePdf.isError ? (
          <p className="basis-full text-sm text-destructive">
            {pdfErrorMessage}
          </p>
        ) : null}
      </div>
    </div>
  )
}
