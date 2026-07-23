import { FileTextIcon, GlobeIcon, Link2Icon } from "lucide-react"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"
import { AddContentMode } from "@/features/library/components/add-content-constants"

interface AddContentModeToggleProps {
  readonly mode: AddContentMode
  readonly disabled: boolean
  readonly onSelect: (mode: AddContentMode) => void
}

export function AddContentModeToggle(props: AddContentModeToggleProps) {
  return (
    <ToggleGroup
      value={[props.mode]}
      onValueChange={(values) => {
        const next = values.at(-1)
        if (!isAddContentMode(next)) return
        props.onSelect(next)
      }}
      variant="outline"
      size="sm"
      disabled={props.disabled}
    >
      <ToggleGroupItem value={AddContentMode.Link} aria-label="Link">
        <Link2Icon />
        Link
      </ToggleGroupItem>
      <ToggleGroupItem value={AddContentMode.Wiki} aria-label="Wiki">
        <GlobeIcon />
        Wiki
      </ToggleGroupItem>
      <ToggleGroupItem value={AddContentMode.Pdf} aria-label="PDF">
        <FileTextIcon />
        PDF
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

function isAddContentMode(value: string | undefined): value is AddContentMode {
  return (
    value === AddContentMode.Link ||
    value === AddContentMode.Wiki ||
    value === AddContentMode.Pdf
  )
}
