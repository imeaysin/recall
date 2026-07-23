import type { ContentResponse } from "@workspace/contracts"

const STATUS_LABELS: Record<ContentResponse["status"], string> = {
  PENDING: "Pending",
  EXTRACTING: "Extracting",
  METADATA: "Generating metadata",
  GRAPH: "Mapping graph",
  EMBEDDING: "Embedding",
  DEFERRED: "Deferred (quota)",
  COMPLETED: "Completed",
  FAILED: "Failed",
}

export function contentStatusLabel(item: ContentResponse) {
  const base = STATUS_LABELS[item.status] ?? item.status
  if (
    item.processingStep &&
    item.status !== "COMPLETED" &&
    item.status !== "FAILED"
  ) {
    return `${base} · ${item.processingStep}`
  }
  return base
}

export function libraryStatusLabel(status: ContentResponse["libraryStatus"]) {
  return status === "QUEUE" ? "Read later" : "Archive"
}
