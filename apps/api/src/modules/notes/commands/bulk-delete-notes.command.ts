import type { BulkDeleteNotesInput } from "@workspace/contracts"
import type { BulkNoteMutationScope } from "../note.scope"

export class BulkDeleteNotesCommand {
  constructor(
    public readonly organizationId: string,
    public readonly userId: string,
    public readonly input: BulkDeleteNotesInput
  ) {}

  get scope(): BulkNoteMutationScope {
    return {
      organizationId: this.organizationId,
      userId: this.userId,
      ids: this.input.ids,
    }
  }
}
