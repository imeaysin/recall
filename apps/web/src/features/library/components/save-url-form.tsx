import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { useSaveUrlContent } from "../hooks/use-content"

type SaveUrlFormProps = {
  readonly url: string
  readonly onUrlChange: (value: string) => void
}

export function SaveUrlForm({ url, onUrlChange }: SaveUrlFormProps) {
  const save = useSaveUrlContent()
  const errorMessage =
    save.error instanceof Error ? save.error.message : "Failed to save URL"

  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        const trimmed = url.trim()
        if (!trimmed) return
        save.mutate(
          { url: trimmed },
          {
            onSuccess: () => onUrlChange(""),
          }
        )
      }}
    >
      <Input
        value={url}
        onChange={(event) => onUrlChange(event.target.value)}
        placeholder="https://example.com/article"
        type="url"
        required
      />
      <Button type="submit" disabled={save.isPending}>
        {save.isPending ? "Saving…" : "Save"}
      </Button>
      {save.isError ? (
        <p className="basis-full text-sm text-destructive">{errorMessage}</p>
      ) : null}
    </form>
  )
}
