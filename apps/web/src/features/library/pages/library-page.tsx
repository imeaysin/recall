import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { LibraryList } from "../components/library-list"
import { SaveUrlForm } from "../components/save-url-form"

export function LibraryPage() {
  const [url, setUrl] = useState("")
  const [tab, setTab] = useState<"QUEUE" | "ARCHIVE">("QUEUE")

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
        <p className="text-sm text-muted-foreground">
          Save articles and YouTube links. Processing runs in the background.
        </p>
      </div>

      <SaveUrlForm url={url} onUrlChange={setUrl} />

      <div className="flex gap-2">
        <Button
          variant={tab === "QUEUE" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("QUEUE")}
        >
          Queue
        </Button>
        <Button
          variant={tab === "ARCHIVE" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("ARCHIVE")}
        >
          Archive
        </Button>
      </div>

      <LibraryList libraryStatus={tab} />
    </div>
  )
}
