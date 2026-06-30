import type { BulkDeleteNotesInput } from "@workspace/contracts"

export class BulkDeleteNotesCommand {
  constructor(
    public readonly userId: string,
    public readonly input: BulkDeleteNotesInput
  ) {}
}
