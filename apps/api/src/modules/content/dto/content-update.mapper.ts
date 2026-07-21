import type { UpdateContent } from "@workspace/contracts"
import type { ContentUpdatePatch } from "../repository"

export function buildContentUpdatePatch(
  input: UpdateContent
): ContentUpdatePatch {
  return {
    ...(input.title !== undefined
      ? { title: input.title, titleEditedByUser: true }
      : {}),
    ...(input.summary !== undefined
      ? { summary: input.summary, summaryEditedByUser: true }
      : {}),
    ...(input.libraryStatus !== undefined
      ? { libraryStatus: input.libraryStatus }
      : {}),
  }
}
