import type { ReactNode } from "react"
import { FileUpIcon, GlobeIcon, Link2Icon, SparklesIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { LIBRARY_CARD_CLASS } from "@/features/library/components/library-card-shared"

export function QuickAddCard({
  isSavingPdf,
  onAddLink,
  onAddWikipedia,
  onAddPdf,
  onAskChat,
}: {
  readonly isSavingPdf: boolean
  readonly onAddLink: () => void
  readonly onAddWikipedia: () => void
  readonly onAddPdf: () => void
  readonly onAskChat: () => void
}) {
  return (
    <Card size="sm" className={cn(LIBRARY_CARD_CLASS, "gap-0 py-0")}>
      <CardContent className="grid min-h-48 flex-1 grid-cols-2 grid-rows-2 gap-0 p-0">
        <QuickAddCell
          icon={<Link2Icon />}
          label="Add link"
          onClick={onAddLink}
          className="border-r border-b"
        />
        <QuickAddCell
          icon={<SparklesIcon />}
          label="Ask chat"
          onClick={onAskChat}
          className="border-b"
        />
        <QuickAddCell
          icon={<GlobeIcon />}
          label="Wikipedia"
          onClick={onAddWikipedia}
          className="border-r"
        />
        <QuickAddCell
          icon={<FileUpIcon />}
          label={isSavingPdf ? "Uploading…" : "PDF"}
          disabled={isSavingPdf}
          onClick={onAddPdf}
        />
      </CardContent>
    </Card>
  )
}

function QuickAddCell(props: {
  readonly icon: ReactNode
  readonly label: string
  readonly onClick?: () => void
  readonly disabled?: boolean
  readonly className?: string
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      disabled={props.disabled}
      onClick={props.onClick}
      className={cn("size-full rounded-none", props.className)}
    >
      <span className="flex flex-col items-center gap-1.5 text-[10px] font-medium tracking-wider uppercase">
        {props.icon}
        {props.label}
      </span>
    </Button>
  )
}
