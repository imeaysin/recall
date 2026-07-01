import type { BulkDeleteNotesInput } from "@workspace/contracts"

export class BulkDeleteNotesCommand {
  constructor(
    public readonly organizationId: string,
    public readonly userId: string,
    public readonly input: BulkDeleteNotesInput
  ) {}
}
