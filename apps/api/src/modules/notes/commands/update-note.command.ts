import type { UpdateNoteInput } from "@workspace/contracts"
import type { NoteMutationScope } from "../note.scope"

export class UpdateNoteCommand {
  constructor(
    public readonly organizationId: string,
    public readonly userId: string,
    public readonly noteId: string,
    public readonly input: UpdateNoteInput
  ) {}

  get scope(): NoteMutationScope {
    return {
      organizationId: this.organizationId,
      userId: this.userId,
      noteId: this.noteId,
    }
  }
}
