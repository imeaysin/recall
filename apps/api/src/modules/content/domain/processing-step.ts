import type { ContentProcessingStep, ContentStatus } from "@workspace/db"

export function activeStatusForStep(
  step: ContentProcessingStep
): ContentStatus {
  switch (step) {
    case "EXTRACT":
      return "EXTRACTING"
    case "METADATA":
      return "METADATA"
    case "GRAPH":
      return "GRAPH"
    case "EMBED":
      return "EMBEDDING"
    default: {
      const _exhaustive: never = step
      return _exhaustive
    }
  }
}
