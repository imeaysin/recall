import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"

interface ChatSendErrorAlertProps {
  readonly message: string
  readonly canRetry: boolean
  readonly onRetry: () => void
}

export function ChatSendErrorAlert(props: ChatSendErrorAlertProps) {
  return (
    <Alert
      variant="destructive"
      className="mx-auto w-full max-w-3xl shrink-0 px-4 md:px-6"
    >
      <AlertDescription className="flex flex-wrap items-center gap-2">
        <span>{props.message}</span>
        {props.canRetry ? (
          <Button size="sm" variant="outline" onClick={props.onRetry}>
            Retry
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  )
}
