import type { ChangeEvent, DragEvent } from "react"
import { useRef } from "react"
import { CloudUploadIcon, FileTextIcon } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import {
  ADD_CONTENT_DROPZONE_BROWSE,
  ADD_CONTENT_DROPZONE_HINT,
  ADD_CONTENT_PDF_ACCEPT,
} from "@/features/library/components/add-content-constants"

interface AddContentDropzoneProps {
  readonly disabled: boolean
  readonly selectedFile: File | null
  readonly onFileSelect: (file: File) => void
  readonly onClearFile: () => void
}

export function AddContentDropzone(props: AddContentDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function takePdf(fileList: FileList | null) {
    const file = fileList?.[0]
    if (!file) return
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) return
    props.onFileSelect(file)
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    if (props.disabled) return
    takePdf(event.dataTransfer.files)
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    takePdf(event.target.files)
    event.target.value = ""
  }

  function openPicker() {
    if (!props.disabled) inputRef.current?.click()
  }

  return (
    <Empty
      role="button"
      tabIndex={0}
      data-disabled={props.disabled ? true : undefined}
      aria-label={`${ADD_CONTENT_DROPZONE_HINT} ${ADD_CONTENT_DROPZONE_BROWSE}`}
      className="data-disabled:pointer-events-none data-disabled:opacity-50"
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return
        event.preventDefault()
        openPicker()
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      onClick={openPicker}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ADD_CONTENT_PDF_ACCEPT}
        className="hidden"
        disabled={props.disabled}
        onChange={onInputChange}
      />
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {props.selectedFile ? <FileTextIcon /> : <CloudUploadIcon />}
        </EmptyMedia>
        {props.selectedFile ? (
          <>
            <EmptyTitle>{props.selectedFile.name}</EmptyTitle>
            <EmptyContent>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={(event) => {
                  event.stopPropagation()
                  props.onClearFile()
                }}
              >
                Remove
              </Button>
            </EmptyContent>
          </>
        ) : (
          <>
            <EmptyDescription>
              {ADD_CONTENT_DROPZONE_HINT}{" "}
              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  openPicker()
                }}
              >
                {ADD_CONTENT_DROPZONE_BROWSE}
              </a>
            </EmptyDescription>
            <EmptyContent>
              <Badge variant="secondary">PDF</Badge>
            </EmptyContent>
          </>
        )}
      </EmptyHeader>
    </Empty>
  )
}
