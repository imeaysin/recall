import { Link2Icon } from "lucide-react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import {
  ADD_CONTENT_URL_PLACEHOLDER,
  AddContentMode,
} from "@/features/library/components/add-content-constants"
import { AddContentDropzone } from "@/features/library/components/add-content-dropzone"
import { AddContentExamples } from "@/features/library/components/add-content-helpers"

interface AddContentBodyProps {
  readonly mode: AddContentMode
  readonly url: string
  readonly file: File | null
  readonly isPending: boolean
  readonly errorMessage: string | null
  readonly onUrlChange: (value: string) => void
  readonly onCreate: () => void
  readonly onFileSelect: (file: File) => void
  readonly onClearFile: () => void
}

export function AddContentBody(props: AddContentBodyProps) {
  return (
    <FieldGroup>
      {props.mode !== AddContentMode.Pdf ? (
        <Field data-disabled={props.isPending ? true : undefined}>
          <FieldLabel htmlFor="add-content-url" className="sr-only">
            URL
          </FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <Link2Icon />
            </InputGroupAddon>
            <InputGroupInput
              id="add-content-url"
              value={props.url}
              onChange={(event) => props.onUrlChange(event.target.value)}
              placeholder={ADD_CONTENT_URL_PLACEHOLDER}
              type="url"
              autoFocus
              disabled={props.isPending}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return
                event.preventDefault()
                props.onCreate()
              }}
            />
          </InputGroup>
        </Field>
      ) : null}
      <AddContentExamples />
      <AddContentDropzone
        disabled={props.isPending}
        selectedFile={props.file}
        onFileSelect={props.onFileSelect}
        onClearFile={props.onClearFile}
      />
      {props.errorMessage ? (
        <Alert variant="destructive">
          <AlertDescription>{props.errorMessage}</AlertDescription>
        </Alert>
      ) : null}
    </FieldGroup>
  )
}
