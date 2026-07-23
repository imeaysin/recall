import { Trash2Icon } from "lucide-react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"

export function LibraryDeleteContentDialog(props: {
  readonly open: boolean
  readonly title: string
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
}) {
  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Move to trash?</AlertDialogTitle>
          <AlertDialogDescription>
            “{props.title}” will move to trash. You can restore it within the
            retention period.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={props.isPending}>
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={props.isPending}
            onClick={props.onConfirm}
          >
            {props.isPending ? <Spinner data-icon="inline-start" /> : null}
            Move to trash
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
