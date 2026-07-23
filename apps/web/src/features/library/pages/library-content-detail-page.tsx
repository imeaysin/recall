import { useNavigate, useParams } from "react-router-dom"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { routes } from "@/config/routes"
import { ApiError } from "@/lib/api"
import { contentErrorLabel } from "@/features/library/domain/content-error-labels"
import { LibraryContentDetailHeader } from "@/features/library/components/library-content-detail-header"
import { LibraryContentDetailMeta } from "@/features/library/components/library-content-detail-meta"
import { LibraryContentDetailSummary } from "@/features/library/components/library-content-detail-summary"
import { LibraryContentDetailTopics } from "@/features/library/components/library-content-detail-topics"
import {
  useContentDetail,
  useRetryContent,
} from "@/features/library/hooks/use-content"
import { PageShell } from "@/features/shell/components/page-shell"

export function LibraryContentDetailPage() {
  const { contentId } = useParams<{ contentId: string }>()
  const navigate = useNavigate()

  if (!contentId) {
    return (
      <PageShell>
        <p className="text-sm text-muted-foreground">Missing content id.</p>
      </PageShell>
    )
  }

  return (
    <LibraryContentDetailView
      key={contentId}
      contentId={contentId}
      onBack={() => navigate(routes.library)}
    />
  )
}

function LibraryContentDetailView(props: {
  readonly contentId: string
  readonly onBack: () => void
}) {
  const detail = useContentDetail(props.contentId)
  const retry = useRetryContent()
  const item = detail.data
  const errorLabel = item ? contentErrorLabel(item.errorCode) : undefined

  if (detail.isLoading) {
    return (
      <PageShell>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full max-w-3xl" />
        <Skeleton className="h-24 w-full max-w-3xl" />
      </PageShell>
    )
  }

  if (detail.isError || !item) {
    const notFound =
      detail.error instanceof ApiError && detail.error.status === 404
    return (
      <PageShell>
        <Alert variant="destructive">
          <AlertTitle>{notFound ? "Not found" : "Could not load"}</AlertTitle>
          <AlertDescription>
            {notFound
              ? "This item is missing or was deleted."
              : (detail.error?.message ?? "Something went wrong.")}
          </AlertDescription>
        </Alert>
        <Button type="button" variant="outline" onClick={props.onBack}>
          Back to library
        </Button>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <LibraryContentDetailHeader item={item} onBack={props.onBack} />
      {item.status === "FAILED" || errorLabel ? (
        <Alert variant="destructive">
          <AlertTitle>Ingestion failed</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <span>
              {errorLabel ?? item.errorMessage ?? "Processing failed."}
            </span>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={retry.isPending}
              className="w-fit"
              onClick={() => retry.mutate(item.id)}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
      {item.status !== "COMPLETED" && item.status !== "FAILED" ? (
        <Alert>
          <AlertTitle>Processing</AlertTitle>
          <AlertDescription>
            This item is still being ingested. Details update automatically.
          </AlertDescription>
        </Alert>
      ) : null}
      <LibraryContentDetailSummary item={item} />
      <LibraryContentDetailTopics item={item} />
      <LibraryContentDetailMeta item={item} />
    </PageShell>
  )
}
