import type { UpdateNoteInput } from "@workspace/contracts"

export class UpdateNoteCommand {
  constructor(
    public readonly organizationId: string,
    public readonly userId: string,
    public readonly noteId: string,
    public readonly input: UpdateNoteInput
  ) {}
}
