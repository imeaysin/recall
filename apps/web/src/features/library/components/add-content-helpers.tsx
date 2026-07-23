import type { ReactNode } from "react"
import { FileTextIcon, GlobeIcon, VideoIcon } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import {
  Field,
  FieldDescription,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field"
import {
  ADD_CONTENT_EXAMPLES,
  AddContentMode,
} from "@/features/library/components/add-content-constants"

export function AddContentExamples() {
  return (
    <FieldSet>
      <FieldLegend variant="label">Examples</FieldLegend>
      <Field>
        <div className="flex flex-wrap gap-2">
          {ADD_CONTENT_EXAMPLES.map((example) => (
            <Badge key={example.id} variant="secondary">
              {exampleIcon(example.id)}
              {example.label}
            </Badge>
          ))}
        </div>
        <FieldDescription>
          Articles, YouTube, and PDF uploads are supported.
        </FieldDescription>
      </Field>
    </FieldSet>
  )
}

export function canCreateContent(config: {
  readonly mode: AddContentMode
  readonly url: string
  readonly file: File | null
}) {
  if (config.mode === AddContentMode.Pdf) return Boolean(config.file)
  return Boolean(config.url.trim())
}

export function resolveContentError(config: {
  readonly urlError: { message: string } | null
  readonly pdfError: { message: string } | null
}) {
  if (config.urlError) return config.urlError.message
  if (config.pdfError) return config.pdfError.message
  return null
}

function exampleIcon(id: string): ReactNode {
  if (id === "youtube") return <VideoIcon data-icon="inline-start" />
  if (id === "pdf") return <FileTextIcon data-icon="inline-start" />
  return <GlobeIcon data-icon="inline-start" />
}
